
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Paper,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { Order, OrderLine, Address } from '@/types/order';
import styles from '@/styles/components/OrderForm.module.css';
import { useRouter } from 'next/router';
import { useAppDispatch } from '@/store/hooks';
import {
  createOrderAsync,
  fetchOrderByIdAsync,
  updateOrderAsync,
} from '@/store/ordersThunks';


interface OrderFormProps {
  mode: 'create' | 'view';
  orderNumber?: string;
}

const blankLine = (): OrderLine => ({
  id: crypto.randomUUID(),
  item: '',
  units: '',
  quantity: 0,
  price: 0,
  amount: 0,
});

const initialOrderState: Omit<Order, 'orderNumber'> = {

  id: crypto.randomUUID(),
  customer: '',
  transactionDate: new Date().toISOString().split('T')[0],
  status: 'Pending',
  fromLocation: '',
  toLocation: '',


  latePickupDate: '',
  earlyPickupDate: '',
  totalShipUnitCount: 0,
  totalQuantity: 0,
  discountRate: 0,
  amount: 0,


  incoterm: '',
  freightTerms: '',

  supportRep: '',
  billingAddress: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  },
  shippingAddress: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  },


  pendingApprovalReasonCode: [],
  lines: [blankLine()],

  history: [],
};

const statusOptions = ['Pending', 'Approved', 'Shipped', 'Cancelled'] as const;



export default function OrderForm({ mode, orderNumber }: OrderFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState(initialOrderState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(mode === 'create');


  useEffect(() => {
    (async () => {
      if (mode === 'view' && orderNumber) {
        setLoading(true);
        try {
          const order = await dispatch(fetchOrderByIdAsync(orderNumber)).unwrap();

          const { orderNumber: _omit, ...rest } = order;
          setFormData(rest);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to fetch order');
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [mode, orderNumber, dispatch]);


  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
   
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'billingAddress' || parent === 'shippingAddress') {
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...(prev[parent] as Address),
            [child]: value
          }
        }));
        return;
      }
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect =
    (field: keyof typeof formData) => (e: SelectChangeEvent<string>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'create') {
       
const newOrder: Order = {
  orderNumber: crypto.randomUUID(),   
  ...formData,
};

const created = await dispatch(createOrderAsync(newOrder)).unwrap();
        router.push(`/orders/${created.orderNumber}`);
      } else if (mode === 'view' && orderNumber && isEditing) {
        await dispatch(
          updateOrderAsync({ orderNumber, ...formData }),
        ).unwrap();
        setIsEditing(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const cancel = () => {
    if (mode === 'create') router.push('/orders/list');
    else {
      setIsEditing(false);
      orderNumber && dispatch(fetchOrderByIdAsync(orderNumber));
    }
  };


  if (loading && mode === 'view' && !isEditing) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper className={styles.formContainer}>
      <Typography variant="h5" className={styles.formTitle}>
        {mode === 'create' ? 'Create New Order' : `Order ${orderNumber}`}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={onSubmit} className={styles.form}>
        <Grid container spacing={3}>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Customer"
              name="customer"
              value={formData.customer}
              onChange={handleInput}
              disabled={!isEditing}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Transaction Date"
              name="transactionDate"
              value={formData.transactionDate}
              onChange={handleInput}
              disabled={!isEditing}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Late Pickup Date"
              name="latePickupDate"
              value={formData.latePickupDate}
              onChange={handleInput}
              disabled={!isEditing}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Amount"
              name="amount"
              value={formData.amount}
              onChange={handleInput}
              disabled={!isEditing}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={handleSelect('status')}
                disabled={!isEditing}
              >
                {statusOptions.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

         
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1">Billing Address</Typography>
              <TextField
                fullWidth
                label="Street"
                name="billingAddress.street"
                value={formData.billingAddress.street}
                onChange={handleInput}
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="City"
                name="billingAddress.city"
                value={formData.billingAddress.city}
                onChange={handleInput}
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="State"
                name="billingAddress.state"
                value={formData.billingAddress.state}
                onChange={handleInput}
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="Postal Code"
                name="billingAddress.postalCode"
                value={formData.billingAddress.postalCode}
                onChange={handleInput}
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="Country"
                name="billingAddress.country"
                value={formData.billingAddress.country}
                onChange={handleInput}
                disabled={!isEditing}
              />
            </Box>
          </Grid>

         
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1">Shipping Address</Typography>
              <TextField
                fullWidth
                label="Street"
                name="shippingAddress.street"
                value={formData.shippingAddress.street}
                onChange={handleInput}
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="City"
                name="shippingAddress.city"
                value={formData.shippingAddress.city}
                onChange={handleInput}
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="State"
                name="shippingAddress.state"
                value={formData.shippingAddress.state}
                onChange={handleInput}
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="Postal Code"
                name="shippingAddress.postalCode"
                value={formData.shippingAddress.postalCode}
                onChange={handleInput}
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="Country"
                name="shippingAddress.country"
                value={formData.shippingAddress.country}
                onChange={handleInput}
                disabled={!isEditing}
              />
            </Box>
          </Grid>
        </Grid>

        <Box className={styles.actionButtons}>
          {mode === 'view' && !isEditing ? (
            <Button variant="contained" onClick={() => setIsEditing(true)}>
              Edit Order
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ mr: 2 }}
              >
                {loading ? <CircularProgress size={20} /> : 'Save'}
              </Button>
              <Button variant="outlined" onClick={cancel} disabled={loading}>
                Cancel
              </Button>
            </>
          )}
        </Box>
      </form>
    </Paper>
  );
}
