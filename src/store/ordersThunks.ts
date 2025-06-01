// store/ordersThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setOrders } from './ordersSlice';
import type { RawOrder } from '@/types/rawOrder';
import type { Order, OrderLine, OrderStatus } from '@/types/order';

const validStatuses = ["", "Pending", "Approved", "Shipped", "Cancelled"] as const;

function parseStatus(status?: string): OrderStatus {
  if (status && validStatuses.includes(status as OrderStatus)) {
    return status as OrderStatus;
  }
  return "";
}

function parseLines(rawLines?: unknown[]): OrderLine[] {
  if (!Array.isArray(rawLines)) return [];

  return rawLines.map(line => {
    const safeLine = line as Partial<OrderLine>;
    return {
      id: safeLine.id ?? crypto.randomUUID(),
      item: safeLine.item ?? "Unknown item",
      units: safeLine.units ?? "",
      quantity: typeof safeLine.quantity === "number" ? safeLine.quantity : 0,
      price: typeof safeLine.price === "number" ? safeLine.price : 0,
      amount: typeof safeLine.amount === "number" ? safeLine.amount : 0,
    };
  });
}

const transformToOrder = (raw: RawOrder): Order => {
  const lines = parseLines(raw.lines);
  const amount = lines.reduce((sum, line) => sum + line.quantity * line.price, 0);

  return {
    id: raw.id ?? crypto.randomUUID(),
    orderNumber: raw.orderNumber.toString(),
    customer: raw.customer,
    transactionDate: raw.transactionDate ?? new Date().toISOString(),
    status: parseStatus(raw.status),
    fromLocation: raw.fromLocation ?? "",
    toLocation: raw.toLocation ?? "",
    pendingApprovalReasonCode: [],
    supportRep: "",
    incoterm: raw.incoterm ?? "",
    freightTerms: raw.freightTerm ?? "",
    totalShipUnitCount: 0,
    totalQuantity: 0,
    discountRate: 0,
    billingAddress: "",
    shippingAddress: "",
    earlyPickupDate: new Date().toISOString(),
    latePickupDate: new Date().toISOString(),
    lines,
    amount,
    history: [],
  };
};

export const fetchOrdersAsync = createAsyncThunk(
  'orders/fetchOrdersAsync',
  async (_, { dispatch }) => {
    const response = await fetch('/api/orders');
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    const data = await response.json();
    const cleanedOrders = (data.orders as RawOrder[]).map(transformToOrder);
    dispatch(setOrders(cleanedOrders));
    return cleanedOrders;
  }
);

export const deleteOrderAsync = createAsyncThunk<string, string>(
    'orders/deleteOrderAsync',
    async (orderNumber, { dispatch }) => {
      console.log('Thunk received orderNumber:', orderNumber, typeof orderNumber);
      
      // Delete the order
      const deleteResponse = await fetch(`/api/orders?orderNumber=${orderNumber}`, {
        method: 'DELETE',
      });

      if (!deleteResponse.ok) {
        const error = await deleteResponse.json();
        throw new Error(error.message || 'Failed to delete order');
      }

      // Reload orders to ensure sync
      const getResponse = await fetch('/api/orders');
      if (!getResponse.ok) {
        throw new Error('Failed to reload orders after deletion');
      }
      
      const data = await getResponse.json();
      const cleanedOrders = (data.orders as RawOrder[]).map(transformToOrder);
      dispatch(setOrders(cleanedOrders));

      return orderNumber;
    }
  );

export const updateOrderStatusAsync = createAsyncThunk(
  'orders/updateOrderStatusAsync',
  async ({ orderNumber, status }: { orderNumber: string; status: Order['status'] }, { dispatch }) => {
    const response = await fetch(`/api/orders?orderNumber=${orderNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    // Reload orders to ensure sync
    const getResponse = await fetch('/api/orders');
    if (!getResponse.ok) {
      throw new Error('Failed to reload orders after status update');
    }
    
    const data = await getResponse.json();
    const cleanedOrders = (data.orders as RawOrder[]).map(transformToOrder);
    dispatch(setOrders(cleanedOrders));

    return { orderNumber, status };
  }
);
 