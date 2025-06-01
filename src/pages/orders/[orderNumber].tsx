import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { useAppDispatch } from '@/store/hooks';
import { fetchOrderByIdAsync } from '@/store/ordersThunks';
import styles from '@/styles/components/OrderForm.module.css';

const statusColors = {
  'Pending': '#FF9800',
  'Approved': '#4CAF50',
  'Shipped': '#2196F3',
  'Cancelled': '#F44336'
};

const fieldStyle = {
  p: 1.5, 
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.05)',
  '&:hover': {
    border: '1px solid rgba(255, 255, 255, 0.5)',
  }
};

export default function ViewOrderPage() {
  const router = useRouter();
  const { orderNumber } = router.query;
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderNumber && typeof orderNumber === 'string') {
      setLoading(true);
      dispatch(fetchOrderByIdAsync(orderNumber))
        .unwrap()
        .then(setOrder)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [orderNumber, dispatch]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '-';
    }
  };

  const calculateOrderTotal = (lines: any[]) => {
    if (!lines || !Array.isArray(lines)) return 0;
    return lines.reduce((total, line) => total + (line.amount || 0), 0);
  };

  if (loading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box className={styles.loadingContainer}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>
            {error || 'Order not found'}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => router.push('/orders/list')}
            className={styles.cancelButton}
          >
            Back to Orders
          </Button>
        </Box>
      </Box>
    );
  }

  const orderTotal = calculateOrderTotal(order.lines);
  const discountAmount = orderTotal * (order.discountRate || 0);
  const finalTotal = orderTotal - discountAmount;

  return (
    <Paper className={styles.formContainer} sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Typography variant="h5" className={styles.formTitle}>
          Order {order.orderNumber}
        </Typography>
      </Box>

      <Box className={styles.form} sx={{ gap: 1.5 }}>
        {/* Basic Information */}
        <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#52a8ec', fontSize: '1.1rem' }}>
            Basic Information
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={4}>
              <Box sx={fieldStyle}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Customer
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', mt: 0.5 }}>
                  {order.customer || '-'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={fieldStyle}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Transaction Date
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', mt: 0.5 }}>
                  {formatDate(order.transactionDate)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={fieldStyle}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip 
                    label={order.status || 'Unknown'} 
                    sx={{ 
                      backgroundColor: statusColors[order.status as keyof typeof statusColors] || '#757575',
                      color: '#fff',
                      fontWeight: 500,
                      minWidth: 100
                    }} 
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Order Totals */}
        <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#52a8ec', fontSize: '1.1rem' }}>
            Order Totals
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={3}>
              <Box sx={fieldStyle}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Total Ship Units
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', mt: 0.5 }}>
                  {order.totalShipUnitCount || '0'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={fieldStyle}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Total Quantity
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', mt: 0.5 }}>
                  {order.totalQuantity || '0'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={fieldStyle}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Discount Rate
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', mt: 0.5 }}>
                  {order.discountRate ? `${(order.discountRate * 100).toFixed(1)}%` : '0%'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={fieldStyle}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Final Total
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', mt: 0.5 }}>
                  ${finalTotal.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Shipping Details */}
        <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#52a8ec', fontSize: '1.1rem' }}>
            Shipping Details
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={3}>
              <Box sx={fieldStyle}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  From Location
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', mt: 0.5 }}>
                  {order.fromLocation || '-'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={fieldStyle}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  To Location
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', mt: 0.5 }}>
                  {order.toLocation || '-'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={fieldStyle}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Incoterm
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', mt: 0.5 }}>
                  {order.incoterm || '-'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={fieldStyle}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Freight Terms
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', mt: 0.5 }}>
                  {order.freightTerms || '-'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Additional Information */}
        <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#52a8ec', fontSize: '1.1rem' }}>
            Additional Information
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={4}>
              <Box sx={fieldStyle}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Support Representative
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', mt: 0.5 }}>
                  {order.supportRep || '-'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={fieldStyle}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Earliest Pickup Date
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', mt: 0.5 }}>
                  {formatDate(order.earlyPickupDate)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={fieldStyle}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Latest Pickup Date
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', mt: 0.5 }}>
                  {formatDate(order.latePickupDate)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={fieldStyle}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Billing Address
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', mt: 0.5, whiteSpace: 'pre-line' }}>
                  {order.billingAddress ? 
                    `${order.billingAddress.street}\n${order.billingAddress.city}, ${order.billingAddress.state} ${order.billingAddress.postalCode}\n${order.billingAddress.country}`
                    : '-'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={fieldStyle}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Shipping Address
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', mt: 0.5, whiteSpace: 'pre-line' }}>
                  {order.shippingAddress ? 
                    `${order.shippingAddress.street}\n${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}\n${order.shippingAddress.country}`
                    : '-'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={fieldStyle}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Pending Approval Reasons
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', mt: 0.5 }}>
                  {order.pendingApprovalReasonCode?.length > 0 
                    ? order.pendingApprovalReasonCode.join(', ')
                    : '-'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Order Lines */}
        <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#52a8ec', fontSize: '1.1rem' }}>
            Order Lines
          </Typography>
          <Grid container spacing={1.5}>
            {order.lines?.map((line: any, index: number) => (
              <Grid item xs={12} key={line.id || index}>
                <Paper sx={{ 
                  p: 1.5, 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Item
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#fff' }}>
                        {line.item || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Units
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#fff' }}>
                        {line.units || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Quantity
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#fff' }}>
                        {line.quantity || '0'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Price
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#fff' }}>
                        ${line.price?.toFixed(2) || '0.00'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Amount
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#fff' }}>
                        ${line.amount?.toFixed(2) || '0.00'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
            {(!order.lines || order.lines.length === 0) && (
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                  No order lines found
                </Typography>
              </Grid>
            )}
            {order.lines && order.lines.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    p: 2,
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                        Subtotal
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                        ${orderTotal.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      textAlign: 'center', 
                      px: 4,
                      borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                        Discount
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 700 }}>
                        -${discountAmount.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                        Total
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 700 }}>
                        ${finalTotal.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Order History */}
        <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#52a8ec', fontSize: '1.1rem' }}>
            Order History
          </Typography>
          <Box sx={{ p: 2 }}>
            <Timeline position="right" sx={{ m: 0, p: 0 }}>
              {order.history?.map((event: any, index: number) => (
                <TimelineItem key={index} sx={{ 
                  minHeight: 'auto',
                  '&:before': {
                    display: 'none'
                  }
                }}>
                  <TimelineSeparator>
                    <TimelineDot sx={{ bgcolor: '#52a8ec' }} />
                    {index < (order.history?.length - 1) && <TimelineConnector sx={{ bgcolor: '#52a8ec' }} />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2" sx={{ color: '#fff' }}>
                      {event.event}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {formatDate(event.timestamp)}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
              {(!order.history || order.history.length === 0) && (
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                  No history available
                </Typography>
              )}
            </Timeline>
          </Box>
        </Paper>

        {/* Back Button - Centered at bottom */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Button 
            variant="contained"
            onClick={() => router.push('/orders/list')}
            sx={{ 
              minWidth: 250,
              height: 48,
              backgroundColor: '#52a8ec',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#3c8fd6'
              }
            }}
          >
            Back to Orders
          </Button>
        </Box>
      </Box>
    </Paper>
  );
} 