export interface MessageTemplate {
  sms: { orderAccepted: string };
  email: {
    orderAccepted: {
      subject: string;
      body: string;
      text: string;
    };
  };
  meta: {
    version: number;
    updated_at: string;
  };
}

/**
 * {
  "sms": {
    "orderAccepted": "Hi {{customer_name}}, your order #{{order_number}} is accepted.\nPickup time: {{pickup_time}}.\n– {{store_name}}"
  },
  "email": {
    "orderAccepted": {
      "subject": "Order {{orderNumber}} Confirmed",
      "body": "Dear {{customerName}},\n\nYour order is confirmed.\nPickup time: {{pickupTime}}"
    }
  },
  "meta": {
    "version": 1,
    "updated_at": "2026-01-21T13:42:03.233Z"
  }
}
 */
