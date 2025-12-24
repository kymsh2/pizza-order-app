import { convertUtcToLocal } from "@/src/utils/dates-helper";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { Component } from "react";
import { Text, View } from "react-native";
import { completeOrder, fetchOrders } from "../../src/api/orders.api";
import { Order, OrderStatus } from "../../src/type/orders";
import styles from "../styles/styles";
import OrderDetail from "./OrderDetail";

interface PizzaOrderState {
  orders: Order[];
  activeTab: number;
  selectedOrder: Order | null;
  now: number;
}

class PizzaOrder extends Component<{}, PizzaOrderState> {
  interval: ReturnType<typeof setInterval> | undefined;

  constructor(props: {}) {
    super(props);
    this.state = {
      orders: [],
      activeTab: 0,
      selectedOrder: null,
      now: Date.now(),
    };
  }

  async componentDidMount() {
    try {
      const orders = await fetchOrders();
      console.log("Fetched orders:", orders);
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
      console.error("Failed to fetch orders:", error);
    }
  }

  componentWillUnmount() {
    if (this.interval) clearInterval(this.interval);
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
        <View style={styles.container}>
          <Text style={styles.heading} onPress={this.handleBack}>
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
        <Text style={styles.heading}>Orders</Text>
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
        {filteredOrders.map((order: Order, idx: number) => (
          <View key={idx} style={[styles.orderListItem]}>
            <View style={styles.orderRow}>
              <View style={styles.orderStatusWrapper}>
                <View style={styles.orderStatusIconCircle}>
                  <FontAwesome
                    name={
                      order.status === OrderStatus.ACCEPTED
                        ? "hourglass-half"
                        : order.status === OrderStatus.COMPLETED
                        ? "check-circle"
                        : "shopping-bag"
                    }
                    size={16}
                    color={
                      order.status === OrderStatus.ACCEPTED
                        ? "#ff6d01"
                        : order.status === OrderStatus.COMPLETED
                        ? "#1c39bb"
                        : "#333"
                    }
                    style={styles.orderStatusIcon}
                  />
                </View>

                {/* ⏱ Pickup Timer */}
                {order.status === OrderStatus.ACCEPTED &&
                  this.getRemainingMinutes(order) !== null &&
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
                      : styles.orderStatusNew
                  }
                >
                  {order.status}
                </Text>
              </View>
              <Text style={styles.orderAmount}>${order.total}</Text>
            </View>
            <View style={styles.orderOverlay}>
              <Text
                style={styles.orderOverlayText}
                onPress={() => this.handleOrderPress(order)}
              >
                {/* Overlay for click */}
              </Text>
            </View>
          </View>
        ))}
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
    console.log("pickupTimeUtcStr:", pickupTimeUtcStr);
    console.log("pickupTimeLocal:", convertUtcToLocal(pickupTimeUtcStr));
    const pickupTime = new Date(pickupTimeUtcStr).getTime();
    const diffMs = pickupTime - this.state.now;
    const diffMin = Math.ceil(diffMs / 60000);
    console.log(
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
      if (order.status !== OrderStatus.ACCEPTED) return order;

      const remaining = this.getRemainingMinutes(order);

      if (remaining! <= 0) {
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
