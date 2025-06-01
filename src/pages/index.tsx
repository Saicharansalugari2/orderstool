import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setOrders } from '../store/ordersSlice';
import DashboardSummaryCards from '../components/dashboard/SummaryCards';
import OrdersByCustomerChart from "../components/dashboard/OrdersByCustomerChart";
import { Container, Box, CircularProgress, Alert } from "@mui/material";
import type { Order, OrderLine, OrderStatus } from '../types/order';
import type { RawOrder } from '../types/rawOrder';
import ExportOrdersButton from '@/components/dashboard/ExportOrdersButton';

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
    billingAddress: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: ""
    },
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: ""
    },
    earlyPickupDate: new Date().toISOString(),
    latePickupDate: new Date().toISOString(),
    lines,
    amount,
    history: [],
  };
};

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();
        // The API returns the array directly, no need to access data.orders
        const cleanedOrders = Array.isArray(data) ? data.map(transformToOrder) : [];
        dispatch(setOrders(cleanedOrders));
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [dispatch]);

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        mt: { xs: 4, sm: 6 }, 
        px: { xs: 1, sm: 2, md: 3 },
        maxWidth: { sm: '100%', md: '90%', lg: '1400px' },
        mx: 'auto'
      }}
    >
      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Box mt={4}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      
      {!loading && !error && (
        <Box 
          display="flex" 
          flexDirection="column" 
          gap={{ xs: 3, sm: 4 }}
          position="relative"
        >
          <DashboardSummaryCards />
          <Box position="relative">
            <OrdersByCustomerChart />
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'flex-end',
                mt: 1, 
                position: 'relative',
                right: { xs: 0, sm: 2 }
              }}
            >
              <ExportOrdersButton />
            </Box>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Home;
