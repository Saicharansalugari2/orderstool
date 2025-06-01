import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import type { Order } from '../../types/order';  
import OrderSuccess from '../../components/OrderSuccess';

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

// Common styles
const commonStyles = {
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(8px)',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      height: '42px',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)',
      },
      '&.Mui-focused': {
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
        border: '1px solid rgba(82, 168, 236, 0.6)',
        boxShadow: '0 0 20px rgba(82, 168, 236, 0.15)',
      },
      '&.MuiInputBase-multiline': {
        height: 'auto',
        padding: '12px',
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '0.875rem',
      transform: 'translate(14px, 12px)',
      transition: 'all 0.2s ease',
      '&.MuiInputLabel-shrink': {
        transform: 'translate(14px, -9px) scale(0.75)',
        color: '#52a8ec',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#52a8ec',
      textShadow: '0 0 8px rgba(82, 168, 236, 0.4)',
    },
    '& input': {
      color: '#fff',
      padding: '12px 14px',
      height: '18px',
      boxSizing: 'border-box',
      '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
        transition: 'background-color 5000s ease-in-out 0s',
        WebkitTextFillColor: '#fff !important',
        WebkitBoxShadow: '0 0 0 1000px rgba(255, 255, 255, 0.07) inset !important',
        borderRadius: '8px',
      },
    },
    '& textarea': {
      color: '#fff',
    },
  },
  select: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(8px)',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      height: '42px',
      display: 'flex',
      alignItems: 'center',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)',
      },
      '&.Mui-focused': {
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
        border: '1px solid rgba(82, 168, 236, 0.6)',
        boxShadow: '0 0 20px rgba(82, 168, 236, 0.15)',
      },
      '& input': {
        '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
          transition: 'background-color 5000s ease-in-out 0s',
          WebkitTextFillColor: '#fff !important',
          WebkitBoxShadow: '0 0 0 1000px rgba(255, 255, 255, 0.07) inset !important',
          borderRadius: '8px',
        },
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '0.875rem',
      transform: 'translate(14px, 12px)',
      transition: 'all 0.2s ease',
      '&.MuiInputLabel-shrink': {
        transform: 'translate(14px, -9px) scale(0.75)',
        color: '#52a8ec',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#52a8ec',
      textShadow: '0 0 8px rgba(82, 168, 236, 0.4)',
    },
    '& .MuiSelect-select': {
      padding: '8px 14px !important',
      height: 'auto !important',
      minHeight: '20px !important',
      display: 'flex',
      alignItems: 'center',
    },
    '& .MuiSelect-icon': {
      color: 'rgba(255, 255, 255, 0.7)',
      right: '12px',
      transition: 'all 0.2s ease',
    },
  },
  datePicker: {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      height: '42px',
    },
    '& .MuiOutlinedInput-input': {
      padding: '12px 14px',
      height: '18px',
      boxSizing: 'border-box',
    },
  },
  card: {
    borderRadius: '16px',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      border: '1px solid rgba(82, 168, 236, 0.3)',
      boxShadow: '0 8px 32px rgba(82, 168, 236, 0.1)',
      background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 100%)',
    },
  },
  sectionTitle: {
    position: 'relative',
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: '-4px',
      left: '0',
      width: '40px',
      height: '2px',
      background: 'linear-gradient(90deg, #52a8ec 0%, rgba(82, 168, 236, 0.2) 100%)',
    },
  },
};


const menuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  minHeight: '20px',
  padding: '8px 14px',
};

export default function CreateOrderPage() {
  const theme = useTheme();
  const [showSuccess, setShowSuccess] = useState(false);
  const [basicInfo, setBasicInfo] = useState({
    orderNumber: '',
    customer: '',
    transactionDate: null as Date | null,
    status: '',
    fromLocation: '',
    toLocation: '',
    pendingApprovalReasonCodes: [] as string[],
    supportRep: '',
    incoterm: '',
    freightTerms: '',
    totalShipUnitCount: '',
    totalQuantity: '',
    discountRate: '',
    billingAddress: '',
    shippingAddress: '',
    earlyPickupDate: null as Date | null,
    latePickupDate: null as Date | null,
  });

  const [orderLines, setOrderLines] = useState([
    { id: 1, item: '', units: '', quantity: 0, price: 0, amount: 0 },
  ]);

  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'discountRate') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        if (numValue > 100) setBasicInfo(prev => ({ ...prev, discountRate: '100' }));
        else if (numValue < 0) setBasicInfo(prev => ({ ...prev, discountRate: '0' }));
        else setBasicInfo(prev => ({ ...prev, discountRate: value }));
        return;
      }
    }

    setBasicInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string) => (date: Date | null) => {
    setBasicInfo(prev => ({ ...prev, [name]: date }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string | string[]>) => {
    const { name, value } = e.target;
    
    if (name === 'incoterm' && value) {
      setBasicInfo(prev => ({ ...prev, incoterm: value as string, freightTerms: '' }));
      return;
    }
    if (name === 'freightTerms' && value) {
      setBasicInfo(prev => ({ ...prev, freightTerms: value as string, incoterm: '' }));
      return;
    }
    if (name === 'pendingApprovalReasonCodes') {
      setBasicInfo(prev => ({ ...prev, [name]: typeof value === 'string' ? [value] : value }));
      return;
    }

    setBasicInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleOrderLineChange = (
    id: number,
    field: keyof Order['lines'][number],
    value: string | number
  ) => {
    setOrderLines(prev =>
      prev.map(line => {
        if (Number(line.id) === id) {
          const updatedLine = { ...line, [field]: value };
        
          const quantity = Number(field === 'quantity' ? value : line.quantity);
          const price = Number(field === 'price' ? value : line.price);
          updatedLine.amount = !isNaN(quantity) && !isNaN(price) ? quantity * price : 0;
          return updatedLine;
        }
        return line;
      })
    );
  };  

  const addOrderLine = () => {
    setOrderLines(prev => [
      ...prev,
      { id: prev.length + 1, item: '', units: '', quantity: 0, price: 0, amount: 0 },
    ]);
  };

  const removeOrderLine = (id: number) => {
    if (orderLines.length > 1) {
    setOrderLines(prev => prev.filter(line => line.id !== id));
    }
  };

  const totalAmount = useMemo(() => {
    return orderLines.reduce((sum, line) => sum + line.amount, 0);
  }, [orderLines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    const requiredFields = {
      orderNumber: 'Order Number',
      customer: 'Customer',
      transactionDate: 'Transaction Date',
      status: 'Status',
      fromLocation: 'From Location',
      toLocation: 'To Location'
    } as const;

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!basicInfo[field as keyof typeof basicInfo]) {
        alert(`${label} is required`);
        return;
      }
    }

    if (!basicInfo.incoterm && !basicInfo.freightTerms) {
      alert('Either Incoterm or Freight Terms must be selected');
      return;
    }

    if (basicInfo.incoterm && basicInfo.freightTerms) {
      alert('Please select either Incoterm or Freight Terms, not both');
      return;
    }

    const totalOrderAmount = orderLines.reduce((sum, line) => sum + line.amount, 0);

    const orderPayload = {
      ...basicInfo,
      transactionDate: basicInfo.transactionDate ? basicInfo.transactionDate.toISOString() : null,
      pendingApprovalReasonCodes: basicInfo.pendingApprovalReasonCodes,
      lines: orderLines.map(line => ({
        ...line,
        quantity: Number(line.quantity),
        price: Number(line.price),
        amount: Number(line.amount)
      })),
      totalAmount: totalOrderAmount
    };
      
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) throw new Error('Failed to submit order');

      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      alert('Error submitting order');
    }
  };

  if (showSuccess) {
    return <OrderSuccess />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box 
        maxWidth={1000} 
        mx="auto" 
        p={{ xs: 1, sm: 2, md: 3 }}
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          fontSize: { xs: '0.813rem', sm: '0.875rem' },
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          minHeight: '100vh',
          color: '#fff',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: { xs: 12, sm: 24 },
            left: { xs: 12, sm: 24 },
            right: { xs: 12, sm: 24 },
            bottom: { xs: 12, sm: 24 },
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            pointerEvents: 'none',
            boxShadow: `
              0 0 0 1px rgba(255, 255, 255, 0.05),
              inset 0 0 30px rgba(255, 255, 255, 0.02)
            `,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: { xs: 13, sm: 25 },
            left: { xs: 13, sm: 25 },
            right: { xs: 13, sm: 25 },
            bottom: { xs: 13, sm: 25 },
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '15px',
            pointerEvents: 'none',
          }
        }}
      >
        <Box sx={{ 
          maxWidth: '100%',
          p: { xs: 1, sm: 2, md: 3 },
          pt: { xs: 3, sm: 4, md: 5 },
        }}>
          <Typography
            variant="h5"
            mb={{ xs: 2, sm: 3, md: 4 }}
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              color: '#52a8ec',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textShadow: '0 0 20px rgba(82, 168, 236, 0.4)',
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Create New Order
          </Typography>

          <Card sx={{ 
            ...commonStyles.card, 
            mb: { xs: 2, sm: 3 }, 
            p: { xs: 2, sm: 3 },
            border: '1px solid rgba(255, 255, 255, 0.08)',
            '&:hover': {
              border: '1px solid rgba(82, 168, 236, 0.3)',
              boxShadow: '0 8px 32px rgba(82, 168, 236, 0.1)',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 100%)',
            },
          }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                ...commonStyles.sectionTitle,
                fontWeight: 600,
                color: '#fff',
                mb: { xs: 2, sm: 3 },
                fontSize: { xs: '0.938rem', sm: '1rem' },
              }}
            >
              Basic Information
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
            
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: { xs: 1.5, sm: 2 } 
              }}>
                <TextField
                  required
                  label="Order Number"
                  name="orderNumber"
                  value={basicInfo.orderNumber}
                  onChange={handleBasicChange}
                  sx={{ ...commonStyles.textField, flex: 1 }}
                />
                <TextField
                  required
                  label="Customer"
                  name="customer"
                  value={basicInfo.customer}
                  onChange={handleBasicChange}
                  sx={{ ...commonStyles.textField, flex: 1 }}
                />
              </Box>

              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: { xs: 1.5, sm: 2 } 
              }}>
                <DatePicker
                  label="Transaction Date *"
                  value={basicInfo.transactionDate}
                  onChange={handleDateChange('transactionDate')}
                  sx={{ ...commonStyles.textField, ...commonStyles.datePicker, flex: 1 }}
                />
                <FormControl required sx={{ ...commonStyles.select, flex: 1 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={basicInfo.status}
                    onChange={handleSelectChange}
                    label="Status"
                  >
                    <MenuItem value="" sx={menuItemStyle}>
                      <em>None</em>
                    </MenuItem>
                    {statusOptions.map(option => (
                      <MenuItem 
                        key={option.value} 
                        value={option.value}
                        sx={{
                          ...menuItemStyle,
                          color: option.color,
                          '&.Mui-selected': {
                            backgroundColor: `${option.color}15`,
                          },
                          '&:hover': {
                            backgroundColor: `${option.color}10`,
                          },
                        }}
                      >
                        {option.value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: { xs: 1.5, sm: 2 } 
              }}>
                <FormControl required sx={{ ...commonStyles.select, flex: 1 }}>
                  <InputLabel>From Location</InputLabel>
                  <Select
                    name="fromLocation"
                    value={basicInfo.fromLocation}
                    onChange={handleSelectChange}
                    label="From Location"
                  >
                    {locationOptions.map(option => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  required
                  label="To Location"
                  name="toLocation"
                  value={basicInfo.toLocation}
                  onChange={handleBasicChange}
                  sx={{ ...commonStyles.textField, flex: 1 }}
                />
              </Box>

             
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: { xs: 1.5, sm: 2 } 
              }}>
                <TextField
                  label="Support Representative"
                  name="supportRep"
                  value={basicInfo.supportRep}
                  onChange={handleBasicChange}
                  sx={{ ...commonStyles.textField, flex: 1 }}
                />
                <FormControl sx={{ ...commonStyles.select, flex: 1 }}>
                  <InputLabel>Pending Approval Reasons</InputLabel>
                  <Select
                    multiple
                    name="pendingApprovalReasonCodes"
                    value={basicInfo.pendingApprovalReasonCodes}
                    onChange={handleSelectChange}
                    label="Pending Approval Reasons"
                    renderValue={(selected) => (
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 0.5,
                        maxWidth: '100%',
                        minHeight: '20px'
                      }}>
                        {(selected as string[]).map((value) => (
                          <Box
                            key={value}
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: { xs: '0.688rem', sm: '0.75rem' },
                              color: '#fff',
                              whiteSpace: 'nowrap',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {value}
                          </Box>
                        ))}
                      </Box>
                    )}
                  >
                    {pendingApprovalReasonCodes.map(code => (
                      <MenuItem 
                        key={code} 
                        value={code}
                        sx={{
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(82, 168, 236, 0.08)',
                          },
                          '&.Mui-selected:hover': {
                            backgroundColor: 'rgba(82, 168, 236, 0.12)',
                          },
                        }}
                      >
                        {code.replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Discount Rate (%)"
                  name="discountRate"
                  type="number"
                  value={basicInfo.discountRate}
                  onChange={handleBasicChange}
                  InputProps={{
                    endAdornment: (
                      <Box component="span" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        %
                      </Box>
                    ),
                  }}
                  sx={{ ...commonStyles.textField, flex: 1 }}
                />
                <Box sx={{ flex: 1 }} /> 
              </Box>
            </Box>
          </Card>

    
          <Card sx={{ 
            ...commonStyles.card, 
            mb: 3, 
            p: 3,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            '&:hover': {
              border: '1px solid rgba(82, 168, 236, 0.3)',
              boxShadow: '0 8px 32px rgba(82, 168, 236, 0.1)',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 100%)',
            },
          }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                ...commonStyles.sectionTitle,
                fontWeight: 600,
                color: '#fff',
                mb: 3,
                fontSize: '1rem',
              }}
            >
              Shipping Details
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
                <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                  <FormControl sx={{ ...commonStyles.select, flex: 1 }}>
                    <InputLabel>Incoterm</InputLabel>
                    <Select
                      name="incoterm"
                      value={basicInfo.incoterm}
                      onChange={handleSelectChange}
                      label="Incoterm"
                    >
                      {incotermOptions.map(option => (
                        <MenuItem key={option} value={option} sx={menuItemStyle}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ ...commonStyles.select, flex: 1 }}>
                    <InputLabel>Freight Terms</InputLabel>
                    <Select
                      name="freightTerms"
                      value={basicInfo.freightTerms}
                      onChange={handleSelectChange}
                      label="Freight Terms"
                    >
                      <MenuItem value="" sx={menuItemStyle}>
                        <em>None</em>
                      </MenuItem>
                      {freightTermsOptions.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                  <TextField
                    label="Total Ship Unit Count"
                    name="totalShipUnitCount"
                    type="number"
                    value={basicInfo.totalShipUnitCount}
                    onChange={handleBasicChange}
                    sx={{ ...commonStyles.textField, flex: 1 }}
                  />
                  <TextField
                    label="Total Quantity"
                    name="totalQuantity"
                    type="number"
                    value={basicInfo.totalQuantity}
                    onChange={handleBasicChange}
                    sx={{ ...commonStyles.textField, flex: 1 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <DatePicker
                    label="Early Pickup Date"
                    value={basicInfo.earlyPickupDate}
                    onChange={handleDateChange('earlyPickupDate')}
                    sx={{ ...commonStyles.textField, ...commonStyles.datePicker, flex: 1 }}
                  />
                  <DatePicker
                    label="Late Pickup Date"
                    value={basicInfo.latePickupDate}
                    onChange={handleDateChange('latePickupDate')}
                    sx={{ ...commonStyles.textField, ...commonStyles.datePicker, flex: 1 }}
                  />
                </Box>
              </Box>

              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
                <TextField
                  fullWidth
                  label="Billing Address"
                  name="billingAddress"
                  multiline
                  rows={2}
                  value={basicInfo.billingAddress}
                  onChange={handleBasicChange}
                  sx={{ ...commonStyles.textField, mb: 3 }}
                />
                <TextField
                  fullWidth
                  label="Shipping Address"
                  name="shippingAddress"
                  multiline
                  rows={2}
                  value={basicInfo.shippingAddress}
                  onChange={handleBasicChange}
                  sx={{ ...commonStyles.textField }}
                />
              </Box>
            </Box>
          </Card>
 
          <Card sx={{ 
            ...commonStyles.card, 
            mb: 3, 
            p: 3,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            '&:hover': {
              border: '1px solid rgba(82, 168, 236, 0.3)',
              boxShadow: '0 8px 32px rgba(82, 168, 236, 0.1)',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 100%)',
            },
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: '#fff',
                  fontSize: '1rem',
                }}
              >
                Order Lines
              </Typography>
              <Button
                startIcon={<AddCircleIcon />}
                onClick={addOrderLine}
                variant="contained"
                size="small"
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  boxShadow: 'none',
                  backgroundColor: theme.palette.primary.main,
                  fontSize: '0.875rem',
                  '&:hover': {
                    boxShadow: 'none',
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                Add Line
              </Button>
            </Box>

            {orderLines.map(line => (
              <Paper
                key={line.id}
                elevation={0}
                sx={{
                  p: 2,
                  mb: 1.5,
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  },
                }}
    >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                  <FormControl required sx={{ ...commonStyles.select, flex: '1 1 200px' }}>
                    <InputLabel>Item </InputLabel>
        <Select
                      value={line.item}
                      onChange={(e) => handleOrderLineChange(line.id, 'item', e.target.value)}
                      label="Item *"
        >
          {itemOptions.map(option => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>

                  <FormControl required sx={{ ...commonStyles.select, flex: '1 1 150px' }}>
                    <InputLabel>Units </InputLabel>
        <Select
                      value={line.units}
                      onChange={(e) => handleOrderLineChange(line.id, 'units', e.target.value)}
                      label="Units *"
        >
          {unitsOptions.map(option => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>

  <TextField
                    required
                    label="Quantity "
    type="number"
                    value={line.quantity}
                    onChange={(e) => handleOrderLineChange(line.id, 'quantity', e.target.value)}
                    sx={{ ...commonStyles.textField, flex: '1 1 100px' }}
  />

  <TextField
                    required
                    label="Price "
    type="number"
                    value={line.price}
                    onChange={(e) => handleOrderLineChange(line.id, 'price', e.target.value)}
                    sx={{ ...commonStyles.textField, flex: '1 1 100px' }}
                  />

                  <Typography 
                    sx={{ 
                      flex: '1 1 100px',
                      fontWeight: 600,
                      color: theme.palette.primary.main 
                    }}
                  >
                    Amount: ${line.amount}
                  </Typography>

                  <IconButton
                    onClick={() => removeOrderLine(line.id)}
                    sx={{
                      color: '#52a8ec',
                      '&:hover': {
                        color: '#3994d6',
                      },
                    }}
        >
                    <DeleteIcon />
                  </IconButton>
    </Box>
              </Paper>
  ))}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, px: 1 }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Total Amount:</Typography>
              <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: '0.875rem' }}>
                ${totalAmount}
              </Typography>
</Box>
          </Card>

          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
<Button
              type="submit"
  variant="contained"
              size="medium"
  sx={{
                borderRadius: '8px',
                px: 5,
                py: 1.5,
                fontSize: '0.875rem',
                textTransform: 'none',
                background: 'linear-gradient(45deg, #52a8ec 30%, #2196F3 90%)',
                boxShadow: '0 4px 12px rgba(82, 168, 236, 0.3)',
    '&:hover': {
                  background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
                  boxShadow: '0 6px 16px rgba(82, 168, 236, 0.4)',
     },
            }}
          >
              Create Order
</Button>
          </Box>
        </Box>
    </Box>
    </LocalizationProvider>
  );
}

