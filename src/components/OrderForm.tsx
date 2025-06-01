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
import type { Order, OrderStatus, OrderLine } from '../types/order';
import styles from '@/styles/components/OrderForm.module.css';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createOrderAsync, fetchOrderByIdAsync, updateOrderAsync } from '@/store/ordersThunks';
import OrderSuccess from '@/components/OrderSuccess';

interface OrderFormProps {
  mode: 'create' | 'view';
  orderNumber?: string;
}

interface StatusOption {
  value: OrderStatus;
  color: string;
}

const statusOptions: StatusOption[] = [
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

const initialOrderState: Omit<Order, 'orderNumber' | 'id'> = {
  customer: '',
  transactionDate: new Date().toISOString().split('T')[0],
  latePickupDate: '',
  amount: 0,
  status: 'Pending',
  fromLocation: '',
  toLocation: '',
  pendingApprovalReasonCode: [],
  supportRep: '',
  incoterm: '',
  freightTerms: '',
  totalShipUnitCount: 0,
  totalQuantity: 0,
  discountRate: 0,
  billingAddress: '',
  shippingAddress: '',
  earlyPickupDate: '',
  lines: [{ id: 'line-1', item: '', units: '', quantity: 0, price: 0, amount: 0 }],
  history: [{ timestamp: new Date().toISOString(), event: 'Order Created' }]
};

export default function OrderForm({ mode, orderNumber }: OrderFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<Omit<Order, 'orderNumber' | 'id'>>(initialOrderState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (mode === 'view' && orderNumber) {
        setLoading(true);
        try {
          const response = await fetch('/api/orders');
          if (!response.ok) {
            throw new Error('Failed to fetch orders');
          }
          const orders = await response.json();
          const orderData = orders.find((order: Order) => order.orderNumber === orderNumber);
          
          if (!orderData) {
            throw new Error('Order not found');
          }

          console.log('Found order data:', JSON.stringify(orderData, null, 2));

          // Format date to YYYY-MM-DD
          const formatDate = (dateString: string | null | undefined) => {
            if (!dateString) return '';
            try {
              return dateString.split('T')[0];
            } catch (e) {
              console.error('Error formatting date:', e);
              return '';
            }
          };

          // Create a new object with the data
          const parsedData: Omit<Order, 'orderNumber' | 'id'> = {
            ...orderData,
            transactionDate: formatDate(orderData.transactionDate),
            earlyPickupDate: formatDate(orderData.earlyPickupDate),
            latePickupDate: formatDate(orderData.latePickupDate)
          };

          console.log('Parsed dates:', {
            transactionDate: parsedData.transactionDate,
            earlyPickupDate: parsedData.earlyPickupDate,
            latePickupDate: parsedData.latePickupDate
          });

          setFormData(parsedData);
        } catch (err) {
          console.error('Error fetching order:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch order');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrderData();
  }, [mode, orderNumber]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === 'create') {
      const { name, value } = e.target;
      
      // Handle numeric fields
      if (name === 'totalShipUnitCount' || name === 'totalQuantity' || name === 'discountRate') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          if (name === 'discountRate') {
            setFormData(prev => ({ 
              ...prev, 
              [name]: Math.min(Math.max(numValue, 0), 100) 
            }));
          } else {
            setFormData(prev => ({ ...prev, [name]: numValue }));
          }
        }
        return;
      }

      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleStatusChange = (e: SelectChangeEvent<OrderStatus>) => {
    if (mode === 'create') {
      setFormData(prev => ({
        ...prev,
        status: e.target.value as OrderStatus
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mode === 'create') {
      setLoading(true);
      setError(null);
      try {
        const result = await dispatch(createOrderAsync({
          ...formData,
          orderNumber: crypto.randomUUID(),
        })).unwrap();
        setShowSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create order');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    router.push('/orders/list');
  };

  const handleOrderLineChange = (
    id: string,
    field: keyof OrderLine,
    value: string | number
  ) => {
    if (mode === 'create') {
      setFormData(prev => ({
        ...prev,
        lines: prev.lines.map(line => {
          if (line.id === id) {
            const updatedLine = { ...line, [field]: value };
            if (field === 'quantity' || field === 'price') {
              const quantity = field === 'quantity' ? Number(value) : line.quantity;
              const price = field === 'price' ? Number(value) : line.price;
              updatedLine.amount = quantity * price;
            }
            return updatedLine;
          }
          return line;
        })
      }));
    }
  };

  const addOrderLine = () => {
    if (mode === 'create') {
      const newLine: OrderLine = {
        id: `line-${formData.lines.length + 1}`,
        item: '',
        units: '',
        quantity: 0,
        price: 0,
        amount: 0
      };
      setFormData(prev => ({
        ...prev,
        lines: [...prev.lines, newLine]
      }));
    }
  };

  const removeOrderLine = (id: string) => {
    if (mode === 'create' && formData.lines.length > 1) {
      setFormData(prev => ({
        ...prev,
        lines: prev.lines.filter(line => line.id !== id)
      }));
    }
  };

  const commonInputProps = {
    inputProps: { 
      style: { color: 'white' },
      placeholder: ' '
    },
    sx: { 
      '& .MuiInputBase-input': { 
        color: 'white',
        '&::placeholder': {
          color: 'rgba(255, 255, 255, 0.5)',
          opacity: 1
        }
      },
      '& .Mui-disabled': { 
        color: 'rgba(255, 255, 255, 0.8)',
        WebkitTextFillColor: 'rgba(255, 255, 255, 0.8)'
      },
      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.4)' }
    }
  } as const;

  const commonSelectProps = {
    sx: { 
      '& .MuiSelect-select': { 
        color: 'white',
        '&::placeholder': {
          color: 'rgba(255, 255, 255, 0.5)',
          opacity: 1
        }
      },
      '& .Mui-disabled': { 
        color: 'rgba(255, 255, 255, 0.8)',
        WebkitTextFillColor: 'rgba(255, 255, 255, 0.8)'
      },
      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.4)' }
    }
  } as const;

  const getStatusColor = (status: OrderStatus): string => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || '#52a8ec';
  };

  const getStatusStyles = (status: OrderStatus) => {
    const color = getStatusColor(status);
    return {
      color: color,
      '&.Mui-selected': {
        backgroundColor: `${color}15`,
        color: color
      },
      '&:hover': {
        backgroundColor: `${color}10`
      },
      '&.Mui-selected:hover': {
        backgroundColor: `${color}20`
      }
    };
  };

  const handleSelectChange = (e: SelectChangeEvent<string | string[]>) => {
    const { name, value } = e.target;
    
    if (name === 'incoterm' && value) {
      setFormData(prev => ({ ...prev, incoterm: value as string, freightTerms: '' }));
      return;
    }
    if (name === 'freightTerms' && value) {
      setFormData(prev => ({ ...prev, freightTerms: value as string, incoterm: '' }));
      return;
    }
    if (name === 'pendingApprovalReasonCode') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: typeof value === 'string' ? [value] : value 
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading && mode === 'view') {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (showSuccess) {
    return <OrderSuccess />;
  }

  return (
    <Paper className={styles.formContainer}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton 
          onClick={() => router.push('/orders/list')}
          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" className={styles.formTitle}>
          {mode === 'create' ? 'Create New Order' : `Order ${orderNumber}`}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className={styles.alert}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: '#52a8ec', mb: 2 }}>Basic Information</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              {...commonInputProps}
              fullWidth
              label="Customer Name"
              name="customer"
              value={formData.customer}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              required
              placeholder="Enter customer name"
              InputLabelProps={{ 
                shrink: true,
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              {...commonInputProps}
              fullWidth
              label="Transaction Date"
              name="transactionDate"
              type="date"
              value={formData.transactionDate}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              required
              InputLabelProps={{ 
                shrink: true,
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>From Location</InputLabel>
              <Select
                {...commonSelectProps}
                name="fromLocation"
                value={formData.fromLocation}
                onChange={handleSelectChange}
                disabled={mode === 'view'}
                label="From Location"
              >
                {locationOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              {...commonInputProps}
              fullWidth
              label="To Location"
              name="toLocation"
              value={formData.toLocation}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              required
              placeholder="Enter destination"
              InputLabelProps={{ 
                shrink: true,
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select<OrderStatus>
                {...commonSelectProps}
                name="status"
                value={formData.status}
                onChange={handleStatusChange}
                disabled={mode === 'view'}
                label="Status"
              >
                {statusOptions.map(option => (
                  <MenuItem 
                    key={option.value} 
                    value={option.value}
                    sx={getStatusStyles(option.value)}
                  >
                    {option.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Pending Approval Reason</InputLabel>
              <Select
                {...commonSelectProps}
                name="pendingApprovalReasonCode"
                value={formData.pendingApprovalReasonCode}
                onChange={handleSelectChange}
                disabled={mode === 'view'}
                label="Pending Approval Reason"
                multiple
              >
                {pendingApprovalReasonCodes.map(code => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Order Lines */}
          {formData.lines.map((line) => (
            <Box 
              key={line.id}
              sx={{
                display: 'flex',
                gap: 2,
                mb: 2,
                p: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                alignItems: 'center'
              }}
            >
              <FormControl sx={{ flex: 2 }}>
                <InputLabel>Item</InputLabel>
                <Select
                  {...commonSelectProps}
                  value={line.item}
                  onChange={(e) => handleOrderLineChange(line.id, 'item', e.target.value)}
                  disabled={mode === 'view'}
                  label="Item"
                >
                  {itemOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Units</InputLabel>
                <Select
                  {...commonSelectProps}
                  value={line.units}
                  onChange={(e) => handleOrderLineChange(line.id, 'units', e.target.value)}
                  disabled={mode === 'view'}
                  label="Units"
                >
                  {unitsOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                {...commonInputProps}
                label="Quantity"
                type="number"
                value={line.quantity}
                onChange={(e) => handleOrderLineChange(line.id, 'quantity', Number(e.target.value))}
                disabled={mode === 'view'}
                sx={{ flex: 1, ...commonInputProps.sx }}
              />

              <TextField
                {...commonInputProps}
                label="Price"
                type="number"
                value={line.price}
                onChange={(e) => handleOrderLineChange(line.id, 'price', Number(e.target.value))}
                disabled={mode === 'view'}
                sx={{ flex: 1, ...commonInputProps.sx }}
              />

              <Typography sx={{ flex: 1, color: '#52a8ec' }}>
                ${line.amount.toFixed(2)}
              </Typography>

              {mode === 'create' && formData.lines.length > 1 && (
                <IconButton 
                  onClick={() => removeOrderLine(line.id)}
                  sx={{ color: '#f44336' }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}

          {/* Dates Section */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: '#52a8ec', mb: 2, mt: 2 }}>Dates</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              {...commonInputProps}
              fullWidth
              label="Early Pickup Date"
              name="earlyPickupDate"
              type="date"
              value={formData.earlyPickupDate}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              {...commonInputProps}
              fullWidth
              label="Late Pickup Date"
              name="latePickupDate"
              type="date"
              value={formData.latePickupDate}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Address Section */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: '#52a8ec', mb: 2, mt: 2 }}>Address Information</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              {...commonInputProps}
              fullWidth
              label="Billing Address"
              name="billingAddress"
              multiline
              rows={3}
              value={formData.billingAddress}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              {...commonInputProps}
              fullWidth
              label="Shipping Address"
              name="shippingAddress"
              multiline
              rows={3}
              value={formData.shippingAddress}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Total Amount */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 2,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              pt: 2
            }}>
              <Typography variant="h6" sx={{ 
                color: '#52a8ec',
                fontSize: '1.5rem',
                fontWeight: 600
              }}>
                Total Amount: ${formData.lines.reduce((sum, line) => sum + line.amount, 0).toFixed(2)}
              </Typography>
            </Box>
          </Grid>

          <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
            <TextField
              label="Total Ship Unit Count"
              name="totalShipUnitCount"
              type="number"
              inputProps={{ min: 0, step: 1 }}
              value={formData.totalShipUnitCount}
              onChange={handleInputChange}
              sx={{ ...commonInputProps.sx, flex: 1 }}
            />
            <TextField
              label="Total Quantity"
              name="totalQuantity"
              type="number"
              inputProps={{ min: 0, step: 1 }}
              value={formData.totalQuantity}
              onChange={handleInputChange}
              sx={{ ...commonInputProps.sx, flex: 1 }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
            <TextField
              label="Discount Rate (%)"
              name="discountRate"
              type="number"
              inputProps={{ min: 0, max: 100, step: 0.01 }}
              value={formData.discountRate}
              onChange={handleInputChange}
              sx={{ ...commonInputProps.sx, flex: 1 }}
            />
          </Box>
        </Grid>

        <Box className={styles.actionButtons}>
          {mode === 'create' ? (
            <>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Order'}
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
          ) : (
            <Button
              variant="contained"
              onClick={() => router.push('/orders/list')}
              sx={{ 
                minWidth: '300px',
                fontSize: '1rem',
                padding: '8px 16px',
                margin: '0 auto',
                display: 'block',
                marginTop: '32px',
                '& .MuiSvgIcon-root': {
                  fontSize: '1rem'
                }
              }}
            >
              <ArrowBackIcon style={{ marginRight: '8px' }} /> Back to Orders
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
} 