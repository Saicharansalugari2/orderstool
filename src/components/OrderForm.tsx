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
  Card,
  IconButton,
  Paper,
  useTheme,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { Order } from '../types/order';
import styles from '@/styles/components/OrderForm.module.css';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createOrderAsync, fetchOrderByIdAsync, updateOrderAsync } from '@/store/ordersThunks';

interface OrderFormProps {
  mode: 'create' | 'view';
  orderNumber?: string;
}

const statusOptions = [
  { value: 'Pending', color: '#FF9800' },
  { value: 'Approved', color: '#4CAF50' },
  { value: 'Shipped', color: '#2196F3' },
  { value: 'Cancelled', color: '#F44336' }
];

const locationOptions = ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Warehouse D'];
const incotermOptions = ['EXW', 'FOB', 'CIF', 'DDP', 'DAP'];
const freightTermsOptions = ['Prepaid', 'Collect'];
const pendingApprovalReasonCodes = [
  'PRICE_DISCREPANCY',
  'CREDIT_HOLD',
  'STOCK_SHORTAGE',
  'CUSTOMER_REQUEST',
];

const itemOptions = ['Gloves', 'Masks', 'Cups and Lids', 'Cutlery', 'Pans'];
const unitsOptions = ['Box', 'Pack', 'Piece', 'Set'];

const initialOrderState: Omit<Order, 'orderNumber'> = {
  customer: '',
  transactionDate: new Date().toISOString().split('T')[0],
  latePickupDate: '',
  amount: 0,
  status: 'Pending',
};

export default function OrderForm({ mode, orderNumber }: OrderFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState(initialOrderState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(mode === 'create');

  useEffect(() => {
    const fetchOrderData = async () => {
      if (mode === 'view' && orderNumber) {
        setLoading(true);
        try {
          const orderData = await dispatch(fetchOrderByIdAsync(orderNumber)).unwrap();
          setFormData(orderData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch order');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrderData();
  }, [mode, orderNumber, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      status: e.target.value as Order['status']
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'create') {
        const result = await dispatch(createOrderAsync(formData)).unwrap();
        router.push(`/orders/${result.orderNumber}`);
      } else if (mode === 'view' && orderNumber && isEditing) {
        await dispatch(updateOrderAsync({ orderNumber, ...formData })).unwrap();
        setIsEditing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'create') {
      router.push('/orders/list');
    } else {
      setIsEditing(false);
      // Reset form data to original state
      if (orderNumber) {
        dispatch(fetchOrderByIdAsync(orderNumber));
      }
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
        <Alert severity="error" className={styles.alert}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Customer Name"
              name="customer"
              value={formData.customer}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Transaction Date"
              name="transactionDate"
              type="date"
              value={formData.transactionDate}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Late Pickup Date"
              name="latePickupDate"
              type="date"
              value={formData.latePickupDate}
              onChange={handleInputChange}
              disabled={!isEditing}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
              InputProps={{
                startAdornment: <span>$</span>
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleStatusChange}
                disabled={!isEditing}
                label="Status"
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Shipped">Shipped</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box className={styles.actionButtons}>
          {mode === 'view' && !isEditing ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsEditing(true)}
              className={styles.editButton}
            >
              Edit Order
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : mode === 'create' ? (
                  'Create Order'
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
                className={styles.cancelButton}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </form>
    </Paper>
  );
} 