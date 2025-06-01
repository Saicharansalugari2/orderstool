

import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider
} from '@mui/material';
import Chart from 'chart.js/auto';
import type {
  ChartType,
  ChartData,
  ChartOptions,
  ChartDataset,
  ScriptableContext
} from 'chart.js';

const ReportsPage: React.FC = () => {
  const orders = useSelector((state: RootState) => state.orders.orders);
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return '#FF9800';
      case 'Approved':
        return '#4CAF50';
      case 'Shipped':
        return '#2196F3';
      case 'Cancelled':
        return '#F44336';
      default:
        return '#5B21B6';
    }
  };

  const calculateTotalAmount = () => {
    return orders.reduce((total, order) => {
      const orderTotal = order.lines.reduce((sum, line) => sum + line.amount, 0);
      return total + orderTotal;
    }, 0);
  };

  const calculateStatusMetrics = () => {
    return orders.reduce<
      Record<string, { count: number; amount: number }>
    >((acc, order) => {
      const status = order.status;
      const orderTotal = order.lines.reduce((sum, line) => sum + line.amount, 0);

      if (!acc[status]) {
        acc[status] = { count: 0, amount: 0 };
      }
      acc[status].count += 1;
      acc[status].amount += orderTotal;
      return acc;
    }, {});
  };

  useEffect(() => {
    if (!chartRef.current) return;
    const metrics = calculateStatusMetrics();

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = Object.keys(metrics);
    const counts = labels.map((status) => metrics[status].count);
    const backgroundColors = labels.map((status) => getStatusColor(status));

    const chartConfig: {
      type: ChartType;
      data: ChartData<'pie', number[], string>;
      options: ChartOptions<'pie'>;
    } = {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: backgroundColors,
            borderColor: '#1a1a1a',
            borderWidth: 3,
            hoverOffset: 20,
            hoverBorderWidth: 4,
            hoverBorderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#FFFFFF', 
              boxWidth: 20,
              boxHeight: 20,
              padding: 25,
              font: {
                size: 16,
                weight: 'bold',
                family: "'Space Grotesk', sans-serif",
              },
              generateLabels: (chart) => {
                const data = chart.data;
                if (!data.datasets || data.datasets.length === 0) return [];

                const dataset = data.datasets[0];
                const labels = data.labels as string[];
                const meta = chart.getDatasetMeta(0);
                const total = (dataset.data as number[]).reduce(
                  (sum, val) => sum + (val || 0),
                  0
                );

                return labels.map((label, i) => {
                  const value = (dataset.data as number[])[i] || 0;
                  const percentage = total
                    ? ((value / total) * 100).toFixed(1)
                    : '0.0';
                  const element = meta.data[i] as unknown as { hidden?: boolean };

                  return {
                    text: `${label} (${value} - ${percentage}%)`,
                    fillStyle: Array.isArray(dataset.backgroundColor)
                      ? dataset.backgroundColor[i]
                      : (dataset.backgroundColor as string),
                    strokeStyle: '#FFFFFF',
                    lineWidth: 1,
                    hidden: element?.hidden ?? false,
                    index: i,
                    fontColor: '#FFFFFF', 
                  };
                });
              },
              filter: (item) => !item.hidden,
            },
            onClick: null,
            onHover: null,
          },
          title: {
            display: true,
            text: 'Orders by Status',
            color: '#FFFFFF',
            font: {
              size: 20,
              weight: 'bold',
              family: "'Space Grotesk', sans-serif",
            },
            padding: { bottom: 20 },
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
              label: (context) => {
                const label = context.label || '';
                const value = context.raw as number;
                const dataset = context.dataset;
                const total = (dataset.data as number[]).reduce(
                  (sum, val) => sum + (val || 0),
                  0
                );
                const percentage = total
                  ? ((value / total) * 100).toFixed(1)
                  : '0.0';
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart',
        },
      },
    };

    chartInstance.current = new Chart(ctx, chartConfig as any);
    chartInstance.current.update();

    return () => {
      chartInstance.current?.destroy();
    };
  }, [orders]);

  const metrics = calculateStatusMetrics();
  const totalAmount = calculateTotalAmount();

  return (
    <Box
      sx={{
        p: 4,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        color: '#FFFFFF',
      }}
    >
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

      <Paper
        sx={{
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
            background:
              'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background:
              'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '400px',
            mb: 4,
          }}
        >
          <canvas ref={chartRef} />
        </Box>

        <Divider
          sx={{
            my: 4,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            '&::before, &::after': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        />

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
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ color: '#FFFFFF', mb: 2, fontWeight: 800 }}
                >
                  Total Orders Value: ${totalAmount.toFixed(2)}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: '#FFFFFF', mb: 1, fontWeight: 600 }}
                >
                  Total Number of Orders: {orders.length}
                </Typography>
              </Paper>
            </Grid>

            {Object.entries(metrics).map(([status, data]) => (
              <Grid item xs={12} sm={6} md={3} key={status}>
                <Paper
                  sx={{
                    p: 3,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    background:
                      'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%)',
                    borderRadius: 2,
                    border: `2px solid ${getStatusColor(status)}40`,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 4px 20px ${getStatusColor(status)}40`,
                      backgroundColor: 'rgba(0, 0, 0, 0.85)',
                      border: `2px solid ${getStatusColor(status)}60`,
                      background:
                        'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.75) 100%)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: `linear-gradient(90deg, transparent, ${getStatusColor(
                        status
                      )}50, transparent)`,
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: `linear-gradient(90deg, transparent, ${getStatusColor(
                        status
                      )}50, transparent)`,
                    },
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: getStatusColor(status),
                      fontWeight: 800,
                      mb: 2,
                      textShadow: `0 0 10px ${getStatusColor(status)}50`,
                      letterSpacing: '0.5px',
                      fontSize: '1.25rem',
                    }}
                  >
                    {status}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: getStatusColor(status),
                      mb: 1,
                      fontWeight: 700,
                      opacity: 0.95,
                      fontSize: '1.1rem',
                      textShadow: `0 0 8px ${getStatusColor(status)}40`,
                    }}
                  >
                    Count: {data.count}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: getStatusColor(status),
                      fontWeight: 700,
                      opacity: 0.95,
                      fontSize: '1.1rem',
                      textShadow: `0 0 8px ${getStatusColor(status)}40`,
                    }}
                  >
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
