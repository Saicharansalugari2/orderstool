
import React, { useMemo } from 'react';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  TooltipItem
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

ChartJS.register(ArcElement, Tooltip, Legend);

const statusColor: Record<string, string> = {
  Pending:   '#FF9800',
  Approved:  '#4CAF50',
  Shipped:   '#2196F3',
  Cancelled: '#F44336',
};

const statusBg = (hex: string) => hex.replace(')', ', 0.1)').replace('#', 'rgba(');

const statusIcon: Record<string, React.ReactNode> = {
  Pending: <PendingIcon sx={{ fontSize: 32, color: statusColor.Pending }} />,
  Approved: <CheckCircleIcon sx={{ fontSize: 32, color: statusColor.Approved }} />,
  Shipped: <LocalShippingIcon sx={{ fontSize: 32, color: statusColor.Shipped }} />,
  Cancelled: <CancelIcon sx={{ fontSize: 32, color: statusColor.Cancelled }} />,
};


const ReportsPage: React.FC = () => {
  const orders = useSelector((s: RootState) => s.orders.orders);


  const { metrics, totalAmount } = useMemo(() => {
    const m: Record<
      string,
      { count: number; amount: number }
    > = {};

    let runningTotal = 0;

    orders.forEach((o) => {
      const amt = o.lines.reduce((s, l) => s + l.amount, 0);
      runningTotal += amt;

      const key = o.status || 'Unknown';
      if (!m[key]) m[key] = { count: 0, amount: 0 };
      m[key].count += 1;
      m[key].amount += amt;
    });

    return { metrics: m, totalAmount: runningTotal };
  }, [orders]);

  

  const labels = Object.keys(metrics);
  const counts = labels.map((l) => metrics[l].count);
    
  const chartData = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: labels.map((l) => statusColor[l] ?? '#5B21B6'),
        borderWidth: 3,
        borderColor: '#1a1a1a',
        hoverOffset: 20,
        hoverBorderWidth: 4,
        hoverBorderColor: '#ffffff',
      },
    ],
  } as const;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#fff',
          font: { size: 14, weight: 'bold' as const, family: 'Space Grotesk, sans-serif' },
          padding: 24,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: (context: TooltipItem<'pie'>) => {
            const total = context.dataset.data.reduce((a, v) => a + (v || 0), 0);
            const value = context.raw as number;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  } as const;


  return (
    <Box
      sx={{
        p: 4,
        minHeight: '100vh',
        bgcolor: 'linear-gradient(135deg,#000 0%,#1a1a1a 100%)',
        color: '#fff',
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ fontWeight: 800, textAlign: 'center', mb: 4 }}
      >
        Orders Analytics Dashboard
      </Typography>

      <Paper
        sx={{
          p: 4,
          maxWidth: 1200,
          mx: 'auto',
          bgcolor: 'rgba(0,0,0,0.8)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 2,
        }}
      >
 
        <Box sx={{ position: 'relative', height: 400, mb: 4 }}>
          <Pie data={chartData} options={chartOptions} />
        </Box>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.2)' }} />

       
          <Grid container spacing={3}>
            <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                bgcolor: 'rgba(0,0,0,0.6)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center'
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Total Orders Value : ${totalAmount.toFixed(2)}
                </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                Total Number of Orders : {orders.length}
                </Typography>
              </Paper>
            </Grid>

          {labels.map((status) => (
              <Grid item xs={12} sm={6} md={3} key={status}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: `2px solid ${statusColor[status]}`,
                  bgcolor: 'rgba(0,0,0,0.8)',
                  boxShadow: `0 2px 15px ${statusColor[status]}80`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {statusIcon[status]}
                  <Typography
                    variant="h6"
                    sx={{ 
                      color: statusColor[status],
                    fontWeight: 800,
                      textShadow: `0 0 12px ${statusColor[status]}cc`
                    }}
                  >
                    {status}
                  </Typography>
                </Box>
                <Typography 
                  sx={{ 
                    color: statusColor[status],
                    fontWeight: 700,
                    textShadow: `0 0 12px ${statusColor[status]}cc`
                  }}
                >
                  Count : {metrics[status].count}
                  </Typography>
                <Typography 
                  sx={{ 
                    color: statusColor[status],
                    fontWeight: 700,
                    textShadow: `0 0 12px ${statusColor[status]}cc`
                  }}
                >
                  Total : ${metrics[status].amount.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
      </Paper>
    </Box>
  );
};

export default ReportsPage; 
