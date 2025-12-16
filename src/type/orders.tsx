// Order lifecycle
export enum OrderStatus {
  NEW = "NEW",
  ACCEPTED = "ACCEPTED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  PROCESSING = "PROCESSING",
}

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    postcode?: string;
  };
  first_order?: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total?: number;
  variation_name?: string | null;
  size?: string | null;
}

export interface Order {
  id: string;
  wc_order_id: number;
  status: OrderStatus;
  created_at: string; // ISO string
  accepted_at?: string | null;
  completed_at?: string | null;
  pickup_at?: string | null;
  prep_minutes?: number | null;
  remaining_seconds?: number | null;
  customer: Customer;
  items: OrderItem[];
  total: number;
  payment_method: string;
  oder_notes?: string | null;
  total_tax?: number;
}

export interface GetActiveOrdersResponse {
  orders: Order[];
}

export interface AcceptOrderRequest {
  order_id: string;
  prep_minutes: number;
}

export interface AcceptOrderResponse {
  success: boolean;
  order: Order;
}

export interface Countdown {
  minutes: number;
  seconds: number;
  overdue: boolean;
}
