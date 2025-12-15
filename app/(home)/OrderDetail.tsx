import React from "react";
import { Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { WooOrder } from "../../src/type/wc_orders";
import styles from "../styles/styles";

interface OrderDetailProps {
  order: WooOrder;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order }) => {
  if (!order) return <Text>No order found.</Text>;

  return (
    <View style={styles.orderDetailContainer}>
      {/* Top price + status */}
      <Text style={styles.totalText}>{order.total}</Text>

      <View style={styles.statusBadge}>
        <Icon name="check" size={18} color="green" />
        <Text style={styles.statusText}>{order.status}</Text>
      </View>

      {/* Order meta section */}
      <View style={styles.metaBox}>
        <Row label="ID" value={order.id} />
        <Row label="Placed on" value={order.date_created} />
        <Row label="Accepted on" value={order.date_modified} />
        <Row label="Fulfillment" value={order.date_completed} />
      </View>

      {/* Customer section */}
      <View style={styles.customerBox}>
        <Text style={styles.customerName}>
          {order.billing.first_name} {order.billing.last_name}
        </Text>

        {order.billing.first_name && (
          <Text style={styles.firstOrder}>★ 1st order</Text>
        )}

        <View style={styles.rowIcon}>
          <Icon name="phone" size={18} />
          <Text style={styles.contactText}>{order.billing.phone}</Text>
        </View>

        <View style={styles.rowIcon}>
          <Icon name="email" size={18} />
          <Text style={styles.contactText}>{order.billing.email}</Text>
        </View>

        {order.billing.first_name && (
          <Text style={styles.note}>
            First time order! You may want to confirm by calling.
          </Text>
        )}
      </View>

      {/* Order items */}
      <Text style={styles.sectionTitle}>Order items</Text>

      {order.line_items.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <Text style={styles.itemQty}>{item.quantity} x</Text>
          <View>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.size && (
              <Text style={styles.sizeText}>Size: {item.size}</Text>
            )}
          </View>
        </View>
      ))}

      <View style={styles.summaryBox}>
        <Row label="Sub-Total" value={order.total} />
        <Row label="Total" value={order.total} bold />
      </View>
    </View>
  );
};

const Row = ({ label, value, bold }: any) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, bold && { fontWeight: "bold" }]}>
      {label}:
    </Text>
    <Text style={[styles.rowValue, bold && { fontWeight: "bold" }]}>
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
