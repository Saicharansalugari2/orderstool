// src/types/order.ts

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type OrderStatus = "" | "Pending" | "Approved" | "Shipped" | "Cancelled";

export interface OrderLine {
  id: string;
  item: string;
  units: string;
  quantity: number;
  price: number;
  amount: number;
}

export interface OrderHistory {
  timestamp: string; // ISO date string
  event: string;
}

export interface Order {
  id?: string;
  orderNumber: string;
  customer: string;
  transactionDate: string;
  status: OrderStatus;
  fromLocation: string;
  toLocation: string;
  pendingApprovalReasonCode: string[];
  supportRep: string;
  incoterm: string;
  freightTerms: string;
  totalShipUnitCount: number;
  totalQuantity: number;
  discountRate: number;
  billingAddress: string;
  shippingAddress: string;
  earlyPickupDate: string;
  latePickupDate: string;
  amount: number;
  lines: OrderLine[];
  history: OrderHistory[];
}
