import React, { Component } from "react";
import { Text, View } from "react-native";
import getPizzaOrders from "./orderData";
import styles from "./styles";

// Helper to parse duration string to seconds
type Order = {
  customer: string;
  address: string;
  pizza: string;
  size: string;
  status: string;
  orderReadyTime: string;
};

function parseDuration(durationStr: string): number {
  const [value, unit] = durationStr.split(" ");
  const num = parseInt(value, 10);
  if (unit.startsWith("min")) return num * 60;
  if (unit.startsWith("sec")) return num;
  return 0;
}

interface PizzaOrderState {
  timers: number[];
  orders: Order[];
}

class PizzaOrder extends Component<{}, PizzaOrderState> {
  interval: ReturnType<typeof setInterval> | undefined;

  constructor(props: {}) {
    super(props);
    const orders = getPizzaOrders();
    this.state = {
      timers: orders.map((order: Order) => parseDuration(order.orderReadyTime)),
      orders,
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState((prevState) => ({
        timers: prevState.timers.map((t: number) => (t > 0 ? t - 1 : 0)),
      }));
    }, 1000);
  }

  componentWillUnmount() {
    if (this.interval) clearInterval(this.interval);
  }

  formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  render() {
    const { orders, timers } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Pizza Delivery Orders</Text>
        {orders.map((order: Order, idx: number) => (
          <View key={idx} style={styles.orderCard}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>Order #{idx + 1}</Text>
              <Text>Customer: {order.customer}</Text>
              <Text>Address: {order.address}</Text>
              <Text>Pizza: {order.pizza}</Text>
              <Text>Size: {order.size}</Text>
              <Text>Status: {order.status}</Text>
            </View>
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                {this.formatTime(timers[idx])}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  }
}

export default PizzaOrder;
