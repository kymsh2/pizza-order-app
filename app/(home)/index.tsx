import React, { Component } from "react";
import { Text, View } from "react-native";
import { fetchOrders } from "../../src/api/orders.api";
import { WooOrder } from "../../src/type/orders";
import styles from "../styles";

function parseDuration(durationStr: string): number {
  const [value, unit] = durationStr.split(" ");
  const num = parseInt(value, 10);
  if (unit.startsWith("min")) return num * 60;
  if (unit.startsWith("sec")) return num;
  return 0;
}

interface PizzaOrderState {
  timers: number[];
  orders: WooOrder[];
}

class PizzaOrder extends Component<{}, PizzaOrderState> {
  interval: ReturnType<typeof setInterval> | undefined;

  constructor(props: {}) {
    super(props);
    this.state = {
      timers: [],
      orders: [],
    };
  }

  async componentDidMount() {
    try {
      const orders = await fetchOrders();
      console.log("Fetched orders:", orders);
      this.setState({
        orders,
        timers: orders.map((order: WooOrder) => parseDuration(30 + " min")),
      });
      this.interval = setInterval(() => {
        this.setState((prevState) => ({
          timers: prevState.timers.map((t: number) => (t > 0 ? t - 1 : 0)),
        }));
      }, 1000);
    } catch (error: any) {
      // Optionally handle error state here
      console.error("Failed to fetch orders:", error);
    }
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
        {orders.map((order: WooOrder, idx: number) => (
          <View key={idx} style={styles.orderCard}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>Order {order.id}</Text>
              <Text>Status: {order.status}</Text>
              <Text>Order Date Time: {order.date_created}</Text>
              <Text>Amount: {order.total}</Text>
              <Text>Customer: {order.billing.first_name}</Text>
              <Text>Address: {order.shipping.address_1}</Text>
              <Text>Pizza: {order.line_items[0]?.name}</Text>
              <Text>
                Size:{" "}
                {
                  order.line_items[0]?.meta_data.find(
                    (meta) => meta.key === "size"
                  )?.value
                }
              </Text>
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
