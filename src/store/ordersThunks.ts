
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
  const amount = lines.reduce((sum, line) => sum + (line.amount || 0), 0);

  return {
    id: raw.id ?? crypto.randomUUID(),
    orderNumber: raw.orderNumber.toString(),
    customer: raw.customer || '',
    transactionDate: raw.transactionDate ?? new Date().toISOString(),
    status: parseStatus(raw.status),
    fromLocation: raw.fromLocation || '',
    toLocation: raw.toLocation || '',
    pendingApprovalReasonCode: raw.pendingApprovalReasonCode || [],
    supportRep: raw.supportRep || '',
    incoterm: raw.incoterm || '',
    freightTerms: raw.freightTerms || '',
    totalShipUnitCount: raw.totalShipUnitCount || 0,
    totalQuantity: raw.totalQuantity || 0,
    discountRate: raw.discountRate || 0,
    billingAddress: raw.billingAddress || {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    shippingAddress: raw.shippingAddress || {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    earlyPickupDate: raw.earlyPickupDate || new Date().toISOString(),
    latePickupDate: raw.latePickupDate || new Date().toISOString(),
    lines,
    amount,
    history: raw.history || []
  };
};



export const fetchOrdersAsync = createAsyncThunk(
  'orders/fetchOrdersAsync',
  async (_, { dispatch }) => {
    const response = await fetch('/api/orders');
    if (!response.ok) throw new Error('Failed to fetch orders');

    const data = await response.json();
    const cleanedOrders = (data.orders as RawOrder[]).map(transformToOrder);

    dispatch(setOrders(cleanedOrders));
    return cleanedOrders;
  }
);

export const deleteOrderAsync = createAsyncThunk<string, string>(
  'orders/deleteOrderAsync',
  async (orderNumber, { dispatch }) => {
    const del = await fetch(`/api/orders?orderNumber=${orderNumber}`, { method: 'DELETE' });
    if (!del.ok) {
      const err = await del.json();
      throw new Error(err.message ?? 'Failed to delete order');
    }

 
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to reload orders after deletion');

    const data = await res.json();
    const cleanedOrders = (data.orders as RawOrder[]).map(transformToOrder);
    dispatch(setOrders(cleanedOrders));

    return orderNumber;
  }
);

export const updateOrderStatusAsync = createAsyncThunk(
  'orders/updateOrderStatusAsync',
  async ({ orderNumber, status }: { orderNumber: string; status: Order['status'] }, { dispatch }) => {
    const put = await fetch(`/api/orders?orderNumber=${orderNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!put.ok) throw new Error('Failed to update order status');

    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to reload orders after status update');

    const data = await res.json();
    const cleanedOrders = (data.orders as RawOrder[]).map(transformToOrder);
    dispatch(setOrders(cleanedOrders));

    return { orderNumber, status };
  }
);


export const createOrderAsync = createAsyncThunk<
  Order,          // return type
  Order,          // argument type
  { rejectValue: string }
>('orders/createOrderAsync', async (order, { dispatch, rejectWithValue }) => {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const saved = transformToOrder(await res.json());

   
    await dispatch(fetchOrdersAsync());

    return saved;
  } catch (err: any) {
    return rejectWithValue(err.message ?? 'Failed to create order');
  }
});


export const fetchOrderByIdAsync = createAsyncThunk<Order, string>(
  'orders/fetchOrderByIdAsync',
  async (orderNumber) => {
    const res = await fetch(`/api/orders?orderNumber=${orderNumber}`);
    if (!res.ok) throw new Error('Failed to fetch order');

    const raw: RawOrder = await res.json();
    return transformToOrder(raw);
  }
);


export const updateOrderAsync = createAsyncThunk<
  Order,
  Order,
  { rejectValue: string }
>('orders/updateOrderAsync', async (order, { dispatch, rejectWithValue }) => {
  try {
    const res = await fetch(`/api/orders?orderNumber=${order.orderNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error('Network response was not ok');

    const updated = transformToOrder(await res.json());

   
    await dispatch(fetchOrdersAsync());

    return updated;
  } catch (err: any) {
    return rejectWithValue(err.message ?? 'Failed to update order');
  }
});

