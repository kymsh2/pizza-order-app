import {
  subscribeToOrders,
  unsubscribeFromOrders,
} from "@/src/supabase/subscribe";
import { convertUtcToLocal } from "@/src/utils/dates-helper";
import { appLog } from "@/src/utils/logger";
import {
  playNewOrderSound,
  showNewOrderNotification,
} from "@/src/utils/notifications";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { Component } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { completeOrder, fetchOrders } from "../../src/api/orders.api";
import { Order, OrderStatus } from "../../src/type/orders";
import styles from "../styles/styles";
import OrderDetail from "./OrderDetail";

interface PizzaOrderState {
  orders: Order[];
  activeTab: number;
  selectedOrder: Order | null;
  now: number;
  refreshing: boolean;
}

class PizzaOrder extends Component<{}, PizzaOrderState> {
  interval: ReturnType<typeof setInterval> | undefined;
  realtimeChannel: any;

  constructor(props: {}) {
    super(props);
    this.state = {
      orders: [],
      activeTab: 0,
      selectedOrder: null,
      now: Date.now(),
      refreshing: false,
    };
  }

  async componentDidMount() {
    try {
      const orders = await fetchOrders();
      appLog("Fetched orders:", orders);

      // Set up real-time subscription for NEW orders
      this.realtimeChannel = subscribeToOrders(async (order, event) => {
        // Play sound and show notification for new orders
        try {
          await playNewOrderSound();
          await showNewOrderNotification(order.id);
        } catch (error) {
          appLog("Notification error:", error);
        }

        // refresh order list
        const latestOrders = await fetchOrders();
        this.setState({ orders: latestOrders });
      });

      // Automatically complete orders that are ready
      const updatedOrders = this.processCompletedOrders(orders);
      this.setState({ orders: updatedOrders, now: Date.now() });

      // Every minute, automatically complete orders that are ready
      this.interval = setInterval(() => {
        this.setState((prevState) => {
          const updatedOrders = this.processCompletedOrders(prevState.orders);
          return {
            // Update the orders list if there are changes
            orders: updatedOrders.length > 0 ? updatedOrders : prevState.orders,
            // Update the current time
            now: Date.now(),
          };
        });
      }, 60000); // every minute
    } catch (error: any) {
      // Optionally handle error state here
      appLog("Failed to fetch orders:", error);
    }
  }

  componentWillUnmount() {
    if (this.interval) clearInterval(this.interval);

    if (this.realtimeChannel) {
      unsubscribeFromOrders(this.realtimeChannel);
    }
  }

  handleOrderPress = (order: Order) => {
    this.setState({ selectedOrder: order });
  };

  handleOrderUpdated = (updatedOrder: Order) => {
    this.setState((prev) => ({
      orders: prev.orders.map((o) =>
        o.id === updatedOrder.id ? updatedOrder : o
      ),
      selectedOrder: updatedOrder,
    }));
  };

  handleBack = () => {
    this.setState({ selectedOrder: null });
  };

  handleManualRefresh = async () => {
    if (this.state.refreshing) return;
    this.setState({ refreshing: true });

    try {
      const orders = await fetchOrders(); // your existing API
      this.setState({ orders });
    } catch (err) {
      appError("Manual refresh failed", err);
    } finally {
      this.setState({ refreshing: false });
    }
  };

  render() {
    const { orders, activeTab, selectedOrder } = this.state;
    const tabNames = ["All", "In progress", "Ready"];
    const getFilteredOrders = () => {
      if (activeTab === 1) {
        return orders.filter(
          (order: Order) => order.status === OrderStatus.ACCEPTED
        );
      } else if (activeTab === 2) {
        return orders.filter(
          (order: Order) => order.status === OrderStatus.COMPLETED
        );
      }
      return orders;
    };
    const filteredOrders = getFilteredOrders();
    if (selectedOrder) {
      return (
        <View style={[styles.container]}>
          <Text style={[styles.backButton]} onPress={this.handleBack}>
            ← Back
          </Text>
          <OrderDetail
            order={selectedOrder}
            onOrderUpdated={this.handleOrderUpdated}
          />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={[styles.headerRow]}>
          <Text style={styles.heading}>Orders</Text>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={this.handleManualRefresh}
            disabled={this.state.refreshing}
          >
            {this.state.refreshing ? (
              <ActivityIndicator size="small" color="#ff6d01" />
            ) : (
              <Ionicons name="refresh" size={22} color="#ff6d01" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          {tabNames.map((tab, idx) => (
            <Text
              key={tab}
              style={activeTab === idx ? styles.activeTab : styles.tab}
              onPress={() => this.setState({ activeTab: idx })}
            >
              {tab}
            </Text>
          ))}
        </View>

        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          style={{ flex: 1, width: "100%" }}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item: order }) => (
            <Pressable
              style={styles.orderListItem}
              onPress={() => this.handleOrderPress(order)}
            >
              <View style={styles.orderRow}>
                <View style={styles.orderStatusWrapper}>
                  <View style={styles.orderStatusIconCircle}>
                    <FontAwesome
                      name={
                        order.status === OrderStatus.ACCEPTED
                          ? "hourglass-half"
                          : order.status === OrderStatus.COMPLETED
                          ? "shopping-bag"
                          : order.status === OrderStatus.CANCELLED
                          ? "minus"
                          : "shopping-cart"
                      }
                      size={16}
                      color={
                        order.status === OrderStatus.ACCEPTED
                          ? "#ff6d01"
                          : order.status === OrderStatus.COMPLETED
                          ? "#1c39bb"
                          : order.status === OrderStatus.CANCELLED
                          ? "#b71c1c"
                          : "#71dc62"
                      }
                    />
                  </View>

                  {order.status === OrderStatus.ACCEPTED &&
                    this.getRemainingMinutes(order)! > 0 && (
                      <Text style={styles.pickupTimerText}>
                        {this.getRemainingMinutes(order)} min
                      </Text>
                    )}
                </View>

                <View style={styles.orderLeftAdjusted}>
                  <Text style={styles.customerName}>{order.customer.name}</Text>
                  <Text
                    style={
                      order.status === OrderStatus.ACCEPTED
                        ? styles.orderStatusAccepted
                        : order.status === OrderStatus.COMPLETED
                        ? styles.orderStatusCompleted
                        : order.status === OrderStatus.CANCELLED
                        ? styles.orderStatusCancelled
                        : styles.orderStatusNew
                    }
                  >
                    {order.status}
                  </Text>
                </View>

                <Text style={styles.orderAmount}>${order.total}</Text>
              </View>
            </Pressable>
          )}
        />
      </View>
    );
  }

  // Calculate remaining minutes for accepted orders
  getRemainingMinutes(order: Order): number | null {
    let pickupAt = order.pickup_at;

    if (order.status !== OrderStatus.ACCEPTED || !pickupAt) {
      return null;
    }

    const pickupTimeUtcStr =
      pickupAt[pickupAt.length - 1] === "Z" ? pickupAt : pickupAt + "Z";
    appLog("pickupTimeUtcStr:", pickupTimeUtcStr);
    appLog("pickupTimeLocal:", convertUtcToLocal(pickupTimeUtcStr));
    const pickupTime = new Date(pickupTimeUtcStr).getTime();
    const diffMs = pickupTime - this.state.now;
    const diffMin = Math.ceil(diffMs / 60000);
    appLog(
      "Remaining minutes for order",
      order.id,
      ":",
      pickupTime,
      diffMs,
      diffMin
    );

    return diffMin > 0 ? diffMin : 0;
  }

  // Automatically complete orders that are ready
  processCompletedOrders(orders: Order[]): Order[] {
    let hasChanges = false;

    const updatedOrders = orders.map((order) => {
      appLog(
        "Processing order:",
        order.id,
        "-",
        order.status,
        "-",
        order.accepted_at,
        "-",
        order.prep_minutes,
        "-",
        order.remaining_seconds
      );
      if (order.status !== OrderStatus.ACCEPTED) return order;

      const remaining = this.getRemainingMinutes(order);
      appLog("Remaining minutes for order.id ", order.id, " -> ", remaining);

      if (remaining! <= 0) {
        appLog("Completing order:", order.id);
        hasChanges = true;

        // 🔄 Fire & forget backend update
        completeOrder(order.id);

        return {
          ...order,
          status: OrderStatus.COMPLETED,
          completed_at: new Date().toISOString(),
        };
      }

      return order;
    });

    return updatedOrders;
  }
}

export default PizzaOrder;
