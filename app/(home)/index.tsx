import { convertUtcToLocal } from "@/src/utils/dates-helper";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { Component } from "react";
import { Text, View } from "react-native";
import { fetchOrders } from "../../src/api/orders.api";
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
      this.setState({ orders, now: Date.now() });

      this.interval = setInterval(() => {
        this.setState({ now: Date.now() });
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
          <OrderDetail order={selectedOrder} />
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
          <View key={idx} style={styles.orderListItem}>
            <View style={styles.orderRow}>
              <View style={styles.orderStatusIconCircle}>
                {order.status === OrderStatus.ACCEPTED ? (
                  <FontAwesome
                    name="hourglass-half"
                    size={16}
                    color="#ff9800"
                  />
                ) : order.status === OrderStatus.COMPLETED ? (
                  <FontAwesome name="check-circle" size={20} color="#4caf50" />
                ) : (
                  <FontAwesome name="shopping-bag" size={20} color="#333" />
                )}

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

  getRemainingMinutes(order: Order): number | null {
    if (order.status !== OrderStatus.ACCEPTED || !order.pickup_at) {
      return null;
    }
    const pickupTimeUtcStr = order.pickup_at + "Z";
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
}

export default PizzaOrder;
