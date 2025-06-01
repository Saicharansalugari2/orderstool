// store/ordersSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '@/types/order';
import { deleteOrderAsync } from './ordersThunks';

export interface OrdersState {
  orders: Order[];
  orderCount: number;
  loading: boolean;
  error?: string;
}

const saveToLocalStorage = (orders: Order[]) => {
  try {
    localStorage.setItem('orders', JSON.stringify(orders));
  } catch {
    console.error('Failed to save orders to localStorage');
  }
};

const loadFromLocalStorage = (): Order[] => {
  try {
    const stored = localStorage.getItem('orders');
    const orders = stored ? JSON.parse(stored) : [];
    // Ensure all orders have a valid status
    return orders.map((order: Order) => ({
      ...order,
      status: order.status || 'Pending' // Default to 'Pending' if status is empty
    }));
  } catch {
    return [];
  }
};

const initialState: OrdersState = {
  orders: loadFromLocalStorage(),
  orderCount: loadFromLocalStorage().length,
  loading: false,
  error: undefined,
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders(state, action: PayloadAction<Order[]>) {
      // Normalize orderNumber when loading or setting orders and remove duplicates
      const orderMap = new Map<string, Order>();
      
      action.payload.forEach(order => {
        const normalizedOrder = {
          ...order,
          orderNumber: String(order.orderNumber).trim(),
        };
        
        // Keep only the latest order with the same order number
        const existingOrder = orderMap.get(normalizedOrder.orderNumber);
        if (!existingOrder || new Date(normalizedOrder.transactionDate) > new Date(existingOrder.transactionDate)) {
          orderMap.set(normalizedOrder.orderNumber, normalizedOrder);
        }
      });
      
      state.orders = Array.from(orderMap.values());
      state.orderCount = state.orders.length;
      saveToLocalStorage(state.orders);
      
      console.log('Normalized orders:', state.orders.map(o => ({
        orderNumber: o.orderNumber,
        customer: o.customer,
        status: o.status
      })));
    },
    addOrder(state, action: PayloadAction<Order>) {
      const cleanOrder = {
        ...action.payload,
        orderNumber: String(action.payload.orderNumber).trim(),
      };
      state.orders.push(cleanOrder);
      state.orderCount += 1;
      saveToLocalStorage(state.orders);
    },
    updateOrder(state, action: PayloadAction<Order>) {
      const cleanOrderNumber = String(action.payload.orderNumber).trim();
      const index = state.orders.findIndex(
        o => String(o.orderNumber).trim() === cleanOrderNumber
      );
      if (index !== -1) {
        state.orders[index] = {
          ...action.payload,
          orderNumber: cleanOrderNumber,
        };
        saveToLocalStorage(state.orders);
      }
    },
    updateOrderStatus(
      state,
      action: PayloadAction<{ orderNumber: string; status: Order['status'] }>
    ) {
      const { orderNumber, status } = action.payload;
      console.log('Updating order status:', { orderNumber, status });
      
      // Find all instances of the order number
      const orderIndices = state.orders
        .map((order, index) => ({ order, index }))
        .filter(({ order }) => String(order.orderNumber).trim() === String(orderNumber).trim());

      if (orderIndices.length > 0) {
        // If multiple instances exist, keep only the latest one
        const latestOrder = orderIndices.reduce((latest, current) => {
          const currentDate = new Date(current.order.transactionDate);
          const latestDate = new Date(latest.order.transactionDate);
          return currentDate > latestDate ? current : latest;
        });

        // Remove all other instances of this order number
        state.orders = state.orders.filter((_, index) => 
          !orderIndices.map(o => o.index).includes(index) || index === latestOrder.index
        );

        // Update the status of the latest order
        state.orders[latestOrder.index] = {
          ...state.orders[latestOrder.index],
          status: status || 'Pending'
        };

        state.orderCount = state.orders.length;
        saveToLocalStorage(state.orders);
        
        console.log('Updated orders:', state.orders.map(o => ({
          orderNumber: o.orderNumber,
          customer: o.customer,
          status: o.status,
          transactionDate: o.transactionDate
        })));
      } else {
        console.log('Order not found:', orderNumber);
      }
    },
    deleteOrder(state, action: PayloadAction<string>) {
      const cleanPayload = String(action.payload).trim();
      console.log('deleteOrder reducer payload:', cleanPayload);
      console.log('Orders before deletion:', state.orders.map(o => ({ orderNumber: o.orderNumber, type: typeof o.orderNumber })));

      state.orders = state.orders.filter(
        o => String(o.orderNumber).trim() !== cleanPayload
      );
      state.orderCount = state.orders.length;
      saveToLocalStorage(state.orders);

      console.log('Orders after deletion:', state.orders.map(o => o.orderNumber));
    },
    deleteOrderLine(state, action: PayloadAction<{ orderNumber: string; lineId: string }>) {
      const { orderNumber, lineId } = action.payload;
      const orderIndex = state.orders.findIndex(o => String(o.orderNumber).trim() === String(orderNumber).trim());
      
      if (orderIndex !== -1) {
        state.orders[orderIndex] = {
          ...state.orders[orderIndex],
          lines: state.orders[orderIndex].lines.filter(line => line.id !== lineId)
        };
        saveToLocalStorage(state.orders);
      }
    },
    rehydrateOrders(state) {
      const orders = loadFromLocalStorage().map(o => ({
        ...o,
        orderNumber: String(o.orderNumber).trim(),
      }));
      state.orders = orders;
      state.orderCount = orders.length;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(deleteOrderAsync.fulfilled, (state, action: PayloadAction<string>) => {
        const cleanPayload = String(action.payload).trim();
        console.log('deleteOrderAsync.fulfilled payload:', cleanPayload, typeof cleanPayload);
        console.log('Orders before deletion:', state.orders.map(o => ({ orderNumber: o.orderNumber, type: typeof o.orderNumber })));

        state.orders = state.orders.filter(
          o => String(o.orderNumber).trim() !== cleanPayload
        );
        state.orderCount = state.orders.length;
        state.loading = false;
        saveToLocalStorage(state.orders);

        console.log('Orders after deletion:', state.orders.map(o => o.orderNumber));
      })
      .addCase(deleteOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setOrders,
  addOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  deleteOrderLine,
  rehydrateOrders,
} = ordersSlice.actions;

export default ordersSlice.reducer;
