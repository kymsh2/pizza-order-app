import { acceptOrder } from "@/src/api/orders.api";
import { convertUtcToLocal } from "@/src/utils/dates-helper";
import { getStatusColor } from "@/src/utils/status-helper";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { AcceptOrderResponse, Order, OrderStatus } from "../../src/type/orders";
import styles from "../styles/styles";

interface OrderDetailProps {
  order: Order;
  onOrderUpdated: (updatedOrder: Order) => void;
}

const PREP_TIME_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90];

const OrderDetail: React.FC<OrderDetailProps> = ({ order, onOrderUpdated }) => {
  if (!order) return <Text>No order found.</Text>;

  /**
   * Accept order functionality
   */
  // 🔹 NEW STATE
  const [showPickupSelector, setShowPickupSelector] = useState(false);
  const [prepMinutes, setPrepMinutes] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 ACCEPT ORDER HANDLER
  const handleAcceptOrder = async () => {
    if (!prepMinutes) return;

    try {
      setLoading(true);
      setError(null);

      const res: AcceptOrderResponse = await acceptOrder(order.id, prepMinutes);

      if (!res.success) {
        throw new Error("failed to accept order");
      }

      // success → UI should refresh from parent list
      console.log("Order accepted:", res.order.id);
      onOrderUpdated({
        ...order,
        status: OrderStatus.ACCEPTED,
        accepted_at: res.order.accepted_at,
        pickup_at: res.order.pickup_at,
        prep_minutes: res.order.prep_minutes,
      });

      setShowPickupSelector(false);
    } catch (err: any) {
      setError("Failed to accept order");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.orderDetailContainer]}>
      <View style={[styles.statusBadge, { backgroundColor: "#faf4e2" }]}>
        <Icon name="check" size={18} color={getStatusColor(order.status)} />
        <Text
          style={[styles.statusText, { color: getStatusColor(order.status) }]}
        >
          {order.status}
        </Text>
      </View>

      {/* Order meta section */}
      <View style={styles.metaBox}>
        <Row label="ID" value={order.id} />
        <Row
          label="Placed on"
          value={convertUtcToLocal(order.created_at + "Z")}
        />
        <Row
          label="Accepted on"
          value={
            order.accepted_at
              ? convertUtcToLocal(order.accepted_at + "Z")
              : order.accepted_at
          }
        />
        {order.pickup_at && (
          <Row
            label="Pickup on"
            value={convertUtcToLocal(order.pickup_at + "Z")}
          />
        )}
        <Row
          label="Completed on"
          value={
            order.completed_at
              ? convertUtcToLocal(order.completed_at + "Z")
              : order.completed_at
          }
        />
      </View>

      {/* Customer section */}
      <View style={styles.customerBox}>
        <Text style={styles.customerName}>{order.customer.name}</Text>

        {order.customer.first_order && (
          <Text style={styles.firstOrder}>★ 1st order</Text>
        )}

        <View style={styles.rowIcon}>
          <Icon name="phone" size={18} />
          <Text style={styles.contactText}>{order.customer.phone}</Text>
        </View>

        <View style={styles.rowIcon}>
          <Icon name="email" size={18} />
          <Text style={styles.contactText}>{order.customer.email}</Text>
        </View>

        {order.customer.first_order && (
          <Text style={styles.note}>
            First time order! You may want to confirm by calling.
          </Text>
        )}
      </View>

      {/* Order items */}
      <Text style={styles.sectionTitle}>Order items</Text>

      {order.items.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          {/* Left side: Qty + Name */}
          <View style={styles.leftSection}>
            <Text style={styles.itemQty}>{item.quantity} x</Text>

            <View>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.size && (
                <Text style={styles.sizeText}>Size: {item.size}</Text>
              )}
            </View>
          </View>

          {/* Right side: Amount */}
          <Text style={styles.itemAmount}>${item.total?.toFixed(2)}</Text>
        </View>
      ))}

      <View style={styles.summaryBox}>
        <View style={styles.itemRow}>
          {/* Left side: Total label */}
          <View style={styles.leftSection}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
            </View>
          </View>

          {/* Right side: Total Amount */}
          <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
        </View>
      </View>

      {/* 🔴 ACTIONS FOR NEW ORDER */}
      {order.status === "NEW" && (
        <View style={{ marginTop: 20 }}>
          {!showPickupSelector ? (
            <>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => setShowPickupSelector(true)}
              >
                <Text style={styles.acceptButtonText}>ACCEPT ORDER</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Pickup time (minutes)</Text>

              <View style={styles.timeGrid}>
                {PREP_TIME_OPTIONS.map((min) => (
                  <TouchableOpacity
                    key={min}
                    style={[
                      styles.timeButton,
                      prepMinutes === min && styles.timeButtonSelected,
                    ]}
                    onPress={() => setPrepMinutes(min)}
                  >
                    <Text>{min} min</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {error && <Text style={{ color: "red" }}>{error}</Text>}

              <TouchableOpacity
                style={styles.acceptButton}
                onPress={handleAcceptOrder}
                disabled={!prepMinutes || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.acceptButtonText}>CONFIRM & ACCEPT</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const Row = ({ label, value, bold, dollarsign }: any) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, bold && { fontWeight: "bold" }]}>
      {label}:
    </Text>
    <Text style={[styles.rowValue, bold && { fontWeight: "bold" }]}>
      {dollarsign && "$"}
      {value}
    </Text>
  </View>
);

/*return (
    <ScrollView style={{ flex: 1, padding: 18 }}>
      <Text style={styles.heading}>Order Details</Text>
      <View style={styles.orderDetailSection}>
        <Text style={styles.orderDetailLabel}>Order ID:</Text>
        <Text style={styles.orderDetailValue}>{order.id}</Text>
        <Text style={styles.orderDetailLabel}>Date & Time:</Text>
        <Text style={styles.orderDetailValue}>{order.date_created}</Text>
      </View>
      <View style={styles.orderDetailSection}>
        <Text style={styles.orderDetailLabel}>Customer Details</Text>
        <Text>
          Name: {order.billing.first_name} {order.billing.last_name}
        </Text>
        <Text>Email: {order.billing.email}</Text>
        <Text>Phone: {order.billing.phone}</Text>
        <Text>
          Address: {order.shipping.address_1}, {order.shipping.city},{" "}
          {order.shipping.state} {order.shipping.postcode}
        </Text>
      </View>
      <View style={styles.orderDetailSection}>
        <Text style={styles.orderDetailLabel}>Order Items</Text>
        {order.line_items.map((item, idx) => (
          <View key={idx} style={styles.orderItemRow}>
            <Text style={styles.orderItemName}>{item.name}</Text>
            <Text>Qty: {item.quantity}</Text>
            <Text>Price: ${item.total}</Text>
            {item.meta_data && item.meta_data.length > 0 && (
              <View>
                {item.meta_data.map((meta, mIdx) => (
                  <Text key={mIdx} style={styles.orderItemMeta}>
                    {meta.key}: {meta.value}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};*/

export default OrderDetail;
