export interface WooOrder {
  id: number;
  parent_id: number;
  status: string;
  currency: string;
  version: string;
  prices_include_tax: boolean;
  date_created: string;
  date_modified: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  customer_id: number;
  order_key: string;

  billing: WooAddress;
  shipping: WooAddress;

  payment_method: string;
  payment_method_title: string;
  transaction_id: string | null;

  customer_ip_address: string | null;
  customer_user_agent: string | null;

  created_via: string;
  customer_note: string;

  date_completed: string | null;
  date_paid: string | null;
  cart_hash: string | null;
  number: string;

  meta_data: WooMetaData[];

  line_items: WooLineItem[];
  tax_lines: any[];
  shipping_lines: any[];
  fee_lines: any[];
  coupon_lines: any[];
  refunds: any[];

  payment_url: string;
  is_editable: boolean;
  needs_payment: boolean;
  needs_processing: boolean;

  date_created_gmt: string;
  date_modified_gmt: string;
  date_completed_gmt: string | null;
  date_paid_gmt: string | null;

  currency_symbol: string;

  _links: WooOrderLinks;
}

export interface WooAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string; // Billing-only
  phone?: string; // Billing + Shipping (optional)
}

export interface WooMetaData {
  id: number;
  key: string;
  value: string | number | boolean | null;
}

export interface WooLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes: any[];
  meta_data: WooMetaData[];
  sku: string;
  global_unique_id: string;
  price: number;
  image: WooLineItemImage | null;
  parent_name: string | null;
}

export interface WooLineItemImage {
  id: string;
  src: string;
}

export interface WooOrderLinks {
  self: WooLinkItem[];
  collection: WooLinkItem[];
  email_templates?: WooLinkItem[];
}

export interface WooLinkItem {
  href: string;
  embeddable?: boolean;
  targetHints?: {
    allow: string[];
  };
}
