import React from "react";
import { ScrollView, Text, View } from "react-native";
import { WooOrder } from "../../src/type/orders";
import styles from "../styles/styles";

interface OrderDetailProps {
  order: WooOrder;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order }) => {
  if (!order) return <Text>No order found.</Text>;
  return (
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
};

export default OrderDetail;
