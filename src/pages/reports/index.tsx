import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';
import Chart from 'chart.js/auto';

const ReportsPage = () => {
  const orders = useSelector((state: RootState) => state.orders.orders);
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#FF9800';    // Orange from orders list
      case 'Approved': return '#4CAF50';   // Green from orders list
      case 'Shipped': return '#2196F3';    // Blue from orders list
      case 'Cancelled': return '#F44336';  // Red from orders list
      default: return '#5B21B6';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'rgba(255, 152, 0, 0.1)';
      case 'Approved': return 'rgba(76, 175, 80, 0.1)';
      case 'Shipped': return 'rgba(33, 150, 243, 0.1)';
      case 'Cancelled': return 'rgba(244, 67, 54, 0.1)';
      default: return 'rgba(91, 33, 182, 0.1)';
    }
  };

  const calculateTotalAmount = () => {
    return orders.reduce((total, order) => {
      const orderTotal = order.lines.reduce((sum, line) => sum + line.amount, 0);
      return total + orderTotal;
    }, 0);
  };

  const calculateStatusMetrics = () => {
    const metrics = orders.reduce((acc: { [key: string]: { count: number; amount: number } }, order) => {
      const status = order.status;
      const orderTotal = order.lines.reduce((sum, line) => sum + line.amount, 0);
      
      if (!acc[status]) {
        acc[status] = { count: 0, amount: 0 };
      }
      acc[status].count += 1;
      acc[status].amount += orderTotal;
      return acc;
    }, {});

    return metrics;
  };

  useEffect(() => {
    if (!chartRef.current) return;

    const metrics = calculateStatusMetrics();

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(metrics),
        datasets: [{
          data: Object.values(metrics).map(m => m.count),
          backgroundColor: Object.keys(metrics).map(status => getStatusColor(status)),
          borderColor: '#1a1a1a',
          borderWidth: 3,
          hoverOffset: 20,
          hoverBorderWidth: 4,
          hoverBorderColor: '#ffffff',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 20,
              boxHeight: 20,
              padding: 25,
              color: '#FFFFFF',
              font: {
                size: 16,
                weight: 'bold',
                family: "'Space Grotesk', sans-serif",
              },
              generateLabels: function(chart) {
                const data = chart.data;
                const datasets = data.datasets[0];
                const labels = data.labels as string[];
                
                return labels.map((label, i) => {
                  const meta = chart.getDatasetMeta(0);
                  const value = datasets.data[i] as number;
                  const total = datasets.data.reduce((acc: number, val: any) => acc + val, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  
                  return {
                    text: `${label} (${value} - ${percentage}%)`,
                    fillStyle: datasets.backgroundColor?.[i],
                    strokeStyle: '#FFFFFF',
                    lineWidth: 1,
                    hidden: meta.data[i].hidden ?? false,
                    index: i,
                    fontColor: '#FFFFFF'
                  };
                });
              },
              filter: function(item, data) {
                return !item.hidden;
              },
            },
            onClick: null,
            onHover: null,
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#FFFFFF',
            bodyColor: '#FFFFFF',
            titleFont: {
              size: 16,
              weight: 'bold',
              family: "'Space Grotesk', sans-serif",
            },
            bodyFont: {
              size: 14,
              weight: 'bold',
              family: "'Space Grotesk', sans-serif",
            },
            padding: 16,
            cornerRadius: 8,
            displayColors: true,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw as number;
                const total = context.dataset.data.reduce((acc: number, val: any) => acc + val, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          },
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 2000,
          easing: 'easeInOutQuart',
        },
        elements: {
          arc: {
            borderWidth: 2,
          }
        },
      },
    });

    // Force update the chart to apply the new styles
    chartInstance.current.update();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [orders]);

  const metrics = calculateStatusMetrics();
  const totalAmount = calculateTotalAmount();

  return (
    <Box sx={{
      p: 4,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      color: '#FFFFFF',
    }}>
      <Typography 
        variant="h4" 
        gutterBottom
        sx={{
          fontWeight: 800,
          color: '#FFFFFF',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.4)',
          mb: 4,
          textAlign: 'center',
        }}
      >
        Orders Analytics Dashboard
      </Typography>

      <Paper sx={{
        p: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        maxWidth: 1200,
        mx: 'auto',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
        },
      }}>
        <Box sx={{ 
          position: 'relative',
          width: '100%',
          height: '400px',
          mb: 4,
        }}>
          <canvas ref={chartRef} />
        </Box>

        <Divider sx={{ 
          my: 4, 
          borderColor: 'rgba(255, 255, 255, 0.2)',
          '&::before, &::after': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }
        }} />

        <Box sx={{ mt: 4 }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{
              color: '#FFFFFF',
              fontWeight: 800,
              mb: 3,
              textAlign: 'center',
            }}
          >
            Detailed Statistics
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{
                p: 3,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <Typography variant="h5" sx={{ color: '#FFFFFF', mb: 2, fontWeight: 800 }}>
                  Total Orders Value: ${totalAmount.toFixed(2)}
                </Typography>
                <Typography variant="body1" sx={{ color: '#FFFFFF', mb: 1, fontWeight: 600 }}>
                  Total Number of Orders: {orders.length}
                </Typography>
              </Paper>
            </Grid>

            {Object.entries(metrics).map(([status, data]) => (
              <Grid item xs={12} sm={6} md={3} key={status}>
                <Paper sx={{
                  p: 3,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  background: `linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%)`,
                  borderRadius: 2,
                  border: `2px solid ${getStatusColor(status)}40`,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 4px 20px ${getStatusColor(status)}40`,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    border: `2px solid ${getStatusColor(status)}60`,
                    background: `linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.75) 100%)`,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, transparent, ${getStatusColor(status)}50, transparent)`,
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, transparent, ${getStatusColor(status)}50, transparent)`,
                  },
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <Typography variant="h6" sx={{ 
                    color: getStatusColor(status),
                    fontWeight: 800,
                    mb: 2,
                    textShadow: `0 0 10px ${getStatusColor(status)}50`,
                    letterSpacing: '0.5px',
                    fontSize: '1.25rem'
                  }}>
                    {status}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: getStatusColor(status), 
                    mb: 1, 
                    fontWeight: 700,
                    opacity: 0.95,
                    fontSize: '1.1rem',
                    textShadow: `0 0 8px ${getStatusColor(status)}40`
                  }}>
                    Count: {data.count}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: getStatusColor(status), 
                    fontWeight: 700,
                    opacity: 0.95,
                    fontSize: '1.1rem',
                    textShadow: `0 0 8px ${getStatusColor(status)}40`
                  }}>
                    Total: ${data.amount.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReportsPage; 