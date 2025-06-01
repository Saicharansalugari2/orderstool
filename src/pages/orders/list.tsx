import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Tabs,
  Tab,
  IconButton,
  TablePagination,
  CircularProgress,
  TableSortLabel,
  Select,
  MenuItem,
  FormControl,
  Menu,
  ListItemIcon,
  ListItemText,
  Grid,
  Card,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CancelIcon from '@mui/icons-material/Cancel';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import type { Order, OrderStatus } from '../../types/order';
import styles from '@/styles/components/OrderList.module.css';
import CountUp from 'react-countup';
import Papa from 'papaparse';

type StatusFilter = 'All' | 'Pending' | 'Approved' | 'Shipped' | 'Cancelled';
type SortOrder = 'asc' | 'desc';
type SortField = 'orderNumber' | 'customer' | 'transactionDate' | 'latePickupDate' | 'totalAmount' | 'status';

const statusOptions = [
  { 
    value: 'Pending', 
    label: 'Pending', 
    color: '#FF9800',
    icon: <HourglassTopIcon sx={{ fontSize: 20 }} />
  },
  { 
    value: 'Approved', 
    label: 'Approved', 
    color: '#4CAF50',
    icon: <CheckCircleIcon sx={{ fontSize: 20 }} />
  },
  { 
    value: 'Shipped', 
    label: 'Shipped', 
    color: '#2196F3',
    icon: <LocalShippingIcon sx={{ fontSize: 20 }} />
  },
  { 
    value: 'Cancelled', 
    label: 'Cancelled', 
    color: '#F44336',
    icon: <CancelIcon sx={{ fontSize: 20 }} />
  }
];

interface OrderWithTotal extends Order {
  totalAmount: number;
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Invalid Date';
    }
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error, 'for date string:', dateString);
    return 'Invalid Date';
  }
};

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  return `$${Number(amount).toFixed(2)}`;
};

export default function OrderListPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('orderNumber');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) throw new Error('Failed to fetch orders');
        const ordersData = await response.json();
        
        // Process orders to calculate totals and ensure dates
        const processedOrders = ordersData.map(order => {
          // Calculate total amount from order lines
          const totalAmount = order.lines?.reduce((sum, line) => sum + (line.amount || 0), 0) || 0;
          
          return {
            ...order,
            totalAmount,
            transactionDate: order.transactionDate || new Date().toISOString().split('T')[0]
          };
        });
        
        setOrders(processedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: StatusFilter) => {
    setStatusFilter(newValue);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, orderNumber: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(orderNumber);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleViewOrder = (orderNumber: string) => {
    handleMenuClose();
    router.push(`/orders/${encodeURIComponent(orderNumber)}`);
  };

  const handleDeleteOrder = async (orderNumber: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders?orderNumber=${orderNumber}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      setOrders(prevOrders => prevOrders.filter(order => order.orderNumber !== orderNumber) as OrderWithTotal[]);
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!orders.length) return;

    const csvData = orders.map(order => ({
      OrderNumber: order.orderNumber,
      Customer: order.customer,
      TransactionDate: formatDate(order.transactionDate),
      Status: order.status,
      FromLocation: order.fromLocation,
      ToLocation: order.toLocation,
      Amount: formatCurrency(order.totalAmount).replace('$', ''),
      SupportRep: order.supportRep || '',
      BillingAddress: order.billingAddress || '',
      ShippingAddress: order.shippingAddress || '',
      EarlyPickupDate: order.earlyPickupDate ? formatDate(order.earlyPickupDate) : '',
      LatePickupDate: order.latePickupDate ? formatDate(order.latePickupDate) : ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `orders_${formatDate(new Date().toISOString())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusCount = (status: string) => {
    return orders.filter(order => order.status === status).length;
  };

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const sortOrders = (a: OrderWithTotal, b: OrderWithTotal) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'orderNumber':
        return multiplier * a.orderNumber.localeCompare(b.orderNumber);
      case 'customer':
        return multiplier * a.customer.localeCompare(b.customer);
      case 'transactionDate':
        return multiplier * (new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime());
      case 'latePickupDate':
        if (!a.latePickupDate && !b.latePickupDate) return 0;
        if (!a.latePickupDate) return multiplier;
        if (!b.latePickupDate) return -multiplier;
        return multiplier * (new Date(a.latePickupDate).getTime() - new Date(b.latePickupDate).getTime());
      case 'totalAmount':
        return multiplier * (a.totalAmount - b.totalAmount);
      case 'status':
        return multiplier * a.status.localeCompare(b.status);
      default:
        return 0;
    }
  };

  const filteredOrders = Array.isArray(orders) 
    ? orders
        .filter((order: Order) => {
          const matchesSearch = (
            order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchTerm.toLowerCase())
          );
          const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
          return matchesSearch && matchesStatus;
        })
        .sort(sortOrders)
    : [];

  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleStatusChange = async (orderNumber: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderNumber);
      
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderNumber === orderNumber
            ? { ...order, status: newStatus as OrderStatus }
            : order
        )
      );

      const response = await fetch(`/api/orders?orderNumber=${orderNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

    } catch (error) {
      console.error('Error updating order status:', error);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderNumber === orderNumber
            ? { ...order, status: order.status }
            : order
        )
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const calculateStatusMetrics = () => {
    return {
      total: orders.length,
      pending: orders.filter(order => order.status === 'Pending').length,
      approved: orders.filter(order => order.status === 'Approved').length,
      shipped: orders.filter(order => order.status === 'Shipped').length,
      cancelled: orders.filter(order => order.status === 'Cancelled').length,
      totalAmount: orders.reduce((sum, order: OrderWithTotal) => sum + order.totalAmount, 0)
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const metrics = calculateStatusMetrics();

  const summaryCards = [
    {
      label: "Pending Orders",
      value: metrics.pending,
      icon: <HourglassTopIcon aria-label="Pending Orders" sx={{ fontSize: { xs: 28, md: 38 }, color: '#ff9800' }} />,
      gradient: "linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 152, 0, 0.05) 100%)",
      borderGlow: "rgba(255, 152, 0, 0.5)",
    },
    {
      label: "Approved Orders",
      value: metrics.approved,
      icon: <CheckCircleIcon aria-label="Approved Orders" sx={{ fontSize: { xs: 28, md: 38 }, color: '#4caf50' }} />,
      gradient: "linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%)",
      borderGlow: "rgba(76, 175, 80, 0.5)",
    },
    {
      label: "Shipped Orders",
      value: metrics.shipped,
      icon: <LocalShippingIcon aria-label="Shipped Orders" sx={{ fontSize: { xs: 28, md: 38 }, color: '#2196f3' }} />,
      gradient: "linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.05) 100%)",
      borderGlow: "rgba(33, 150, 243, 0.5)",
    },
    {
      label: "Cancelled Orders",
      value: metrics.cancelled,
      icon: <CancelIcon aria-label="Cancelled Orders" sx={{ fontSize: { xs: 28, md: 38 }, color: '#f44336' }} />,
      gradient: "linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(244, 67, 54, 0.05) 100%)",
      borderGlow: "rgba(244, 67, 54, 0.5)",
    },
  ];

  return (
    <Box className={styles.container}>
      {/* Summary Cards Section */}
      <Grid
        container
        spacing={2}
        sx={{
          px: { xs: 2, sm: 4, md: 6 },
          pt: 3,
          pb: 4
        }}
      >
        {summaryCards.map(({ label, value, icon, gradient, borderGlow }, index) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Card
              elevation={4}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              sx={{
                p: 2,
                height: '100%',
                border: "2px solid",
                borderRadius: "16px",
                bgcolor: "rgba(0, 0, 0, 0.7)",
                background: gradient,
                backdropFilter: "blur(10px)",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: hoveredCard === index
                  ? `0 15px 30px rgba(0,0,0,0.4), 0 0 15px ${borderGlow}`
                  : "0 6px 15px rgba(0,0,0,0.2)",
                borderColor: hoveredCard === index 
                  ? borderGlow.replace(", 0.5)", ", 0.8)") 
                  : `${borderGlow.replace(", 0.5)", ", 0.4)")}`,
                cursor: "pointer",
                userSelect: "none",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: hoveredCard === index ? "scale(1.05) translateY(-5px)" : "scale(1) translateY(0)",
                "&:hover": {
                  borderColor: borderGlow,
                },
              }}
            >
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                gap={2}
                mb={1}
                width="100%"
              >
                {React.cloneElement(icon, { 
                  sx: { 
                    fontSize: { xs: 26, md: 32 },
                    color: icon.props.sx.color,
                    transition: "transform 0.3s ease",
                    transform: hoveredCard === index ? "scale(1.1)" : "scale(1)",
                  } 
                })}
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    color: "#fff",
                    textAlign: "left",
                    textShadow: hoveredCard === index ? "0 0 8px rgba(255,255,255,0.5)" : "none",
                    userSelect: "none",
                    fontSize: { xs: "0.8rem", md: "0.9rem" },
                    transition: "all 0.3s ease",
                  }}
                >
                  {label}
                </Typography>
              </Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                textAlign="center"
                sx={{
                  userSelect: "none",
                  fontSize: { xs: "1.2rem", md: "1.4rem" },
                  color: "#fff",
                  textShadow: hoveredCard === index ? "0 0 15px rgba(255,255,255,0.5)" : "none",
                  transition: "all 0.3s ease",
                }}
              >
                <CountUp
                  end={value}
                  duration={2}
                  separator=","
                />
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Header Section */}
      <Box className={styles.header} sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
        px: { xs: 2, sm: 4, md: 6 }
      }}>
        <Box className={styles.searchContainer} sx={{ 
          width: '100%',
          maxWidth: '600px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          ml: { xs: 0, md: 'auto' },
          mr: { xs: 0, md: 4 }
        }}>
          <TextField
            placeholder="Search orders..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            fullWidth
            className={styles.searchInput}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: 'action.active', mr: 1, fontSize: '28px' }} />
              ),
              sx: {
                height: '48px',
                fontSize: '1.1rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: '2px'
                }
              }
            }}
          />
        </Box>
        <Button
          variant="contained"
          endIcon={<FileDownloadIcon sx={{ fontSize: '28px' }} />}
          onClick={handleExport}
          className={styles.exportButton}
          sx={{
            minWidth: 'fit-content',
            ml: { xs: 0, md: 0 },
            mr: { xs: 0, md: 'auto' },
            height: '48px',
            px: 4,
            fontSize: '1.1rem',
            fontWeight: 600,
            borderRadius: '8px',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#1976d2',
              transform: 'translateY(-1px)',
              boxShadow: '0 5px 10px rgba(0,0,0,0.2)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Export AllOrders.csv
        </Button>
      </Box>

      {/* Status Tabs */}
      <Box className={styles.statusTabs}>
        <Tabs 
          value={statusFilter} 
          onChange={handleTabChange} 
          sx={{
            px: 2,
            pt: 2,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.9rem',
              minWidth: 120,
              margin: '0 4px',
              borderRadius: '8px 8px 0 0',
              transition: 'all 0.2s ease',
              bgcolor: '#1a1a1a !important',
              '&.Mui-selected': {
                bgcolor: '#000000 !important',
              }
            },
          }}
          TabIndicatorProps={{
            sx: {
              height: 3,
              borderRadius: '3px 3px 0 0',
              bgcolor: statusFilter === 'All' ? '#fff' : 
                statusOptions.find(opt => opt.value === statusFilter)?.color || '#fff'
            }
          }}
        >
          <Tab 
            sx={{
              color: '#fff !important',
              '&.Mui-selected': {
                color: '#fff !important',
              }
            }}
            icon={<ShoppingCartIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span>All</span>
                <span style={{ opacity: 0.8 }}>({orders.length})</span>
              </Box>
            } 
            value="All" 
          />
          {statusOptions.map((option) => (
            <Tab
              key={option.value}
              icon={option.icon}
              iconPosition="start"
              sx={{
                color: `${option.color} !important`,
                '&.Mui-selected': {
                  color: `${option.color} !important`,
                }
              }}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span>{option.label}</span>
                  <span style={{ opacity: 0.8 }}>({getStatusCount(option.value)})</span>
                </Box>
              }
              value={option.value as StatusFilter}
            />
          ))}
        </Tabs>
      </Box>

      {/* Orders Table */}
      <TableContainer 
        component={Paper} 
        className={styles.tableContainer}
        sx={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          '& .MuiTable-root': {
            borderCollapse: 'separate',
            borderSpacing: '0 8px'
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#2a2a2a' }}>
              <TableCell sx={{ fontWeight: 600, color: '#fff', width: '15%', padding: '16px', '&:first-of-type': { borderTopLeftRadius: '12px' } }}>
                <TableSortLabel
                  active={sortField === 'orderNumber'}
                  direction={sortField === 'orderNumber' ? sortOrder : 'asc'}
                  onClick={() => handleSort('orderNumber')}
                  sx={{
                    color: '#fff !important',
                    '& .MuiTableSortLabel-icon': {
                      color: '#FF6B6B !important',
                      fontSize: '1.5rem',
                      opacity: '1 !important',
                    },
                    '&.Mui-active': {
                      color: '#fff !important',
                    },
                  }}
                >
                  Order #Id
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#fff', width: '20%', padding: '16px', '&:first-of-type': { borderTopLeftRadius: '12px' } }}>
                <TableSortLabel
                  active={sortField === 'customer'}
                  direction={sortField === 'customer' ? sortOrder : 'asc'}
                  onClick={() => handleSort('customer')}
                  sx={{
                    color: '#fff !important',
                    '& .MuiTableSortLabel-icon': {
                      color: '#4ECDC4 !important',
                      fontSize: '1.5rem',
                      opacity: '1 !important',
                    },
                    '&.Mui-active': {
                      color: '#fff !important',
                    },
                  }}
                >
                  Customer Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#fff', width: '20%', padding: '16px', '&:first-of-type': { borderTopLeftRadius: '12px' } }}>
                <TableSortLabel
                  active={sortField === 'transactionDate'}
                  direction={sortField === 'transactionDate' ? sortOrder : 'asc'}
                  onClick={() => handleSort('transactionDate')}
                  sx={{
                    color: '#fff !important',
                    '& .MuiTableSortLabel-icon': {
                      color: '#FFD93D !important',
                      fontSize: '1.5rem',
                      opacity: '1 !important',
                    },
                    '&.Mui-active': {
                      color: '#fff !important',
                    },
                  }}
                >
                  Transaction Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#fff', width: '15%', padding: '16px', '&:first-of-type': { borderTopLeftRadius: '12px' } }}>
                <TableSortLabel
                  active={sortField === 'totalAmount'}
                  direction={sortField === 'totalAmount' ? sortOrder : 'asc'}
                  onClick={() => handleSort('totalAmount')}
                  sx={{
                    color: '#fff !important',
                    '& .MuiTableSortLabel-icon': {
                      color: '#6C9BCF !important',
                      fontSize: '1.5rem',
                      opacity: '1 !important',
                    },
                    '&.Mui-active': {
                      color: '#fff !important',
                    },
                  }}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#fff', width: '20%', padding: '16px', '&:first-of-type': { borderTopLeftRadius: '12px' } }}>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                  sx={{
                    color: '#fff !important',
                    '& .MuiTableSortLabel-icon': {
                      color: '#BA94D1 !important',
                      fontSize: '1.5rem',
                      opacity: '1 !important',
                    },
                    '&.Mui-active': {
                      color: '#fff !important',
                    },
                  }}
                >
                  Order-Status
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#fff', width: '10%', padding: '16px', paddingLeft: '0px', textAlign: 'left', '&:last-of-type': { borderTopRightRadius: '12px' } }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow 
                key={order.orderNumber} 
                className={styles.tableRow}
                onClick={() => router.push(`/orders/${encodeURIComponent(order.orderNumber)}`)}
                sx={{
                  transition: 'all 0.2s ease',
                  my: 1,
                  cursor: 'pointer',
                  '& td': {
                    color: '#fff',
                    borderBottom: 'none',
                  },
                  '& td:first-of-type': {
                    borderTopLeftRadius: '8px',
                    borderBottomLeftRadius: '8px',
                  },
                  '& td:last-of-type': {
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: '8px',
                  },
                  '&:hover': {
                    backgroundColor: order.status === 'Pending' ? 'rgba(255, 152, 0, 0.45) !important' :
                                   order.status === 'Approved' ? 'rgba(76, 175, 80, 0.45) !important' :
                                   order.status === 'Shipped' ? 'rgba(33, 150, 243, 0.65) !important' :
                                   order.status === 'Cancelled' ? 'rgba(244, 67, 54, 0.45) !important' :
                                   'rgba(255, 255, 255, 0.2) !important',
                    '& td': {
                      color: '#fff'
                    }
                  }
                }}
              >
                <TableCell sx={{ padding: '16px' }}>{order.orderNumber}</TableCell>
                <TableCell sx={{ padding: '16px' }}>{order.customer}</TableCell>
                <TableCell sx={{ padding: '16px' }}>{formatDate(order.transactionDate)}</TableCell>
                <TableCell sx={{ padding: '16px' }}>{formatCurrency(order.totalAmount)}</TableCell>
                <TableCell sx={{ padding: '16px' }}>
                  <FormControl size="small" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.orderNumber, e.target.value)}
                      disabled={updatingStatus === order.orderNumber}
                      sx={{
                        minWidth: 120,
                        color: statusOptions.find(opt => opt.value === order.status)?.color || 'inherit',
                        '& .MuiSelect-select': {
                          padding: '6px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }
                      }}
                    >
                      {statusOptions.map((option) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}
                          sx={{
                            color: option.color,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            '&.Mui-selected': {
                              backgroundColor: `${option.color}15`,
                              color: option.color
                            },
                            '&:hover': {
                              backgroundColor: `${option.color}10`
                            }
                          }}
                        >
                          {updatingStatus === order.orderNumber && option.value === order.status ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CircularProgress size={16} sx={{ color: option.color }} />
                              {option.label}
                            </Box>
                          ) : (
                            <>
                              {React.cloneElement(option.icon, { sx: { color: option.color } })}
                              {option.label}
                            </>
                          )}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell sx={{ padding: '16px', paddingLeft: '0px', textAlign: 'left' }}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, order.orderNumber);
                    }}
                    size="small"
                    sx={{
                      color: '#666',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredOrders.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[1, 2, 3, 4, 5, 10, 20, 50]}
        className={styles.tablePagination}
        labelRowsPerPage="Show:"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          mt: 2,
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
          '& .MuiTablePagination-toolbar': {
            justifyContent: 'center',
            color: '#ffffff',
            padding: '8px 16px',
            fontWeight: 700,
            fontSize: '1rem',
          },
          '& .MuiTablePagination-spacer': {
            display: 'none',
          },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-select, & .MuiTablePagination-displayedRows': {
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1rem',
            textShadow: '0 0 1px rgba(255,255,255,0.5)',
          },
          '& .MuiTablePagination-select': {
            backgroundColor: '#1a1a1a',
            '&:focus': {
              backgroundColor: '#2a2a2a',
            },
          },
          '& .MuiTablePagination-actions': {
            marginLeft: 'auto',
            marginRight: '0',
            color: '#ffffff',
            '& .MuiIconButton-root': {
              color: '#ffffff',
              fontWeight: 700,
              '& .MuiSvgIcon-root': {
                fontSize: '24px',
                filter: 'brightness(1.2)',
              },
              '&.Mui-disabled': {
                color: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiSvgIcon-root': {
                  filter: 'brightness(1.5)',
                },
              },
            },
          },
          '& .MuiSelect-icon': {
            color: '#ffffff',
            fontSize: '24px',
            filter: 'brightness(1.2)',
          },
          '& .MuiMenuItem-root': {
            fontWeight: 700,
            fontSize: '1rem',
          }
        }}
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
            borderRadius: '8px',
          },
        }}
      >
        <MenuItem 
          onClick={() => selectedOrder && handleViewOrder(selectedOrder)}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" sx={{ color: '#2196F3' }} />
          </ListItemIcon>
          <ListItemText>View Order</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => selectedOrder && handleDeleteOrder(selectedOrder)}
          sx={{
            color: '#F44336',
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.04)',
            },
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: '#F44336' }} />
          </ListItemIcon>
          <ListItemText>Delete Order</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
