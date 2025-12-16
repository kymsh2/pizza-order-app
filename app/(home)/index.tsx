import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { Component } from "react";
import { Text, View } from "react-native";
import { fetchOrders } from "../../src/api/orders.api";
import { Order, OrderStatus } from "../../src/type/orders";
import styles from "../styles/styles";
import OrderDetail from "./OrderDetail";

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
  activeTab: number;
  selectedOrder: Order | null;
}

class PizzaOrder extends Component<{}, PizzaOrderState> {
  interval: ReturnType<typeof setInterval> | undefined;

  constructor(props: {}) {
    super(props);
    this.state = {
      timers: [],
      orders: [],
      activeTab: 0,
      selectedOrder: null,
    };
  }

  async componentDidMount() {
    try {
      const orders = await fetchOrders();
      console.log("Fetched orders:", orders);
      this.setState({
        orders,
        timers: orders.map((order: Order) => parseDuration(30 + " min")),
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

  handleOrderPress = (order: Order) => {
    this.setState({ selectedOrder: order });
  };

  handleBack = () => {
    this.setState({ selectedOrder: null });
  };

  formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  render() {
    const { orders, timers, activeTab, selectedOrder } = this.state;
    const tabNames = ["All", "In progress", "Ready"];
    const getFilteredOrders = () => {
      if (activeTab === 1) {
        return orders.filter(
          (order: Order) => order.status === OrderStatus.PROCESSING
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
                {order.status === OrderStatus.PROCESSING ? (
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
              </View>
              <View style={styles.orderLeftAdjusted}>
                <Text style={styles.customerName}>{order.customer.name}</Text>
                <Text
                  style={
                    order.status === OrderStatus.PROCESSING
                      ? styles.orderStatusProcessing
                      : order.status === OrderStatus.COMPLETED
                      ? styles.orderStatusCompleted
                      : styles.orderStatus
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
}

export default PizzaOrder;
