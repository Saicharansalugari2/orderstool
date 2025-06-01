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
import OrderSuccess from '@/components/OrderSuccess';

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
  fromLocation: '',
  toLocation: '',
  pendingApprovalReasonCodes: [],
  supportRep: '',
  incoterm: '',
  freightTerms: '',
  totalShipUnitCount: '',
  totalQuantity: '',
  discountRate: '',
  billingAddress: '',
  shippingAddress: '',
  earlyPickupDate: '',
  lines: [{ id: 1, item: '', units: '', quantity: 0, price: 0, amount: 0 }]
};

export default function OrderForm({ mode, orderNumber }: OrderFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState(initialOrderState);
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
          const orderData = orders.find((order: any) => order.orderNumber === orderNumber);
          
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
          const parsedData = {
            ...orderData,
            transactionDate: formatDate(orderData.orderCreatedDate), // Map orderCreatedDate to transactionDate
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
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleStatusChange = (e: SelectChangeEvent) => {
    if (mode === 'create') {
      setFormData(prev => ({
        ...prev,
        status: e.target.value as Order['status']
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create') {
      setLoading(true);
      setError(null);
      try {
        const result = await dispatch(createOrderAsync(formData)).unwrap();
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
    id: number,
    field: string,
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
      setFormData(prev => ({
        ...prev,
        lines: [
          ...prev.lines,
          { id: prev.lines.length + 1, item: '', units: '', quantity: 0, price: 0, amount: 0 }
        ]
      }));
    }
  };

  const removeOrderLine = (id: number) => {
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
  };

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
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Cancelled':
        return '#F44336'; // Red
      case 'Pending':
        return '#FF9800'; // Orange
      case 'Approved':
        return '#4CAF50'; // Green
      case 'Shipped':
        return '#2196F3'; // Blue
      default:
        return '#52a8ec';
    }
  };

  const getStatusStyles = (status: string) => {
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
              value={formData.transactionDate || ''}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              required
              placeholder="Select date"
              InputLabelProps={{ 
                shrink: true,
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
              }}
              sx={{
                ...commonInputProps.sx,
                '& input[type="date"]::-webkit-calendar-picker-indicator': {
                  filter: 'invert(1)'
                }
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
                onChange={handleStatusChange}
                disabled={mode === 'view'}
                label="From Location"
                displayEmpty
                renderValue={(value) => value || "Select location"}
              >
                <MenuItem disabled value="">
                  <em style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Select location</em>
                </MenuItem>
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
              <InputLabel>Incoterm</InputLabel>
              <Select
                {...commonSelectProps}
                name="incoterm"
                value={formData.incoterm}
                onChange={handleStatusChange}
                disabled={mode === 'view' || !!formData.freightTerms}
                label="Incoterm"
              >
                {incotermOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Freight Terms</InputLabel>
              <Select
                {...commonSelectProps}
                name="freightTerms"
                value={formData.freightTerms}
                onChange={handleStatusChange}
                disabled={mode === 'view' || !!formData.incoterm}
                label="Freight Terms"
              >
                {freightTermsOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              {...commonInputProps}
              fullWidth
              label="Support Representative"
              name="supportRep"
              value={formData.supportRep}
              onChange={handleInputChange}
              disabled={mode === 'view'}
              placeholder="Enter representative name"
              InputLabelProps={{ 
                shrink: true,
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <TextField
                {...commonInputProps}
                fullWidth
                label="Status"
                value={formData.status}
                disabled
                InputLabelProps={{ 
                  shrink: true,
                  sx: { color: 'rgba(255, 255, 255, 0.7)' }
                }}
                InputProps={{
                  sx: {
                    color: getStatusColor(formData.status),
                    backgroundColor: `${getStatusColor(formData.status)}15`,
                    '& .MuiInputBase-input': {
                      color: getStatusColor(formData.status),
                      '-webkit-text-fill-color': getStatusColor(formData.status)
                    }
                  }
                }}
              />
            </FormControl>
          </Grid>

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

          {/* Order Lines Section */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: '#52a8ec', mb: 2, mt: 2 }}>Order Lines</Typography>
          </Grid>

          <Grid item xs={12}>
            {formData.lines.map((line, index) => (
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
                  onChange={(e) => handleOrderLineChange(line.id, 'quantity', e.target.value)}
                  disabled={mode === 'view'}
                  placeholder="Enter quantity"
                  sx={{ flex: 1, ...commonInputProps.sx }}
                />

                <TextField
                  {...commonInputProps}
                  label="Price"
                  type="number"
                  value={line.price}
                  onChange={(e) => handleOrderLineChange(line.id, 'price', e.target.value)}
                  disabled={mode === 'view'}
                  placeholder="Enter price"
                  sx={{ flex: 1, ...commonInputProps.sx }}
                />

                <Typography sx={{ flex: 1, color: '#52a8ec' }}>
                  ${line.amount}
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

            {mode === 'create' && (
              <Button
                startIcon={<AddCircleIcon />}
                onClick={addOrderLine}
                sx={{
                  mt: 2,
                  color: '#52a8ec',
                  borderColor: '#52a8ec',
                  '&:hover': {
                    borderColor: '#3994d6',
                    backgroundColor: 'rgba(82, 168, 236, 0.1)',
                  },
                }}
                variant="outlined"
              >
                Add Order Line
              </Button>
            )}
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