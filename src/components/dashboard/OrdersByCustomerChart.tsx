/* src/components/dashboard/OrdersByCustomerChart.tsx */

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAppSelector } from '@/store/hooks';
import { Box, useTheme, useMediaQuery } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type ChartDataType = ChartData<'bar'>;
type ChartOptionsType = ChartOptions<'bar'>;

const OrdersByCustomerChart: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const orders = useAppSelector((s) => s.orders.orders);

  const { amountsByCustomer, maxAmount } = useMemo(() => {
    const totals = orders.reduce<Record<string, number>>((acc, o) => {
      if (o.customer) {
        acc[o.customer] = (acc[o.customer] ?? 0) + (o.amount ?? 0);
      }
      return acc;
    }, {});
    const vals = Object.values(totals) as number[];
    return { amountsByCustomer: totals, maxAmount: vals.length ? Math.max(...vals) : 0 };
  }, [orders]);

  const labels = Object.keys(amountsByCustomer);

  const getGradient = (ctx: CanvasRenderingContext2D) => {
    const g = ctx.createLinearGradient(0, 0, 0, 400);
    g.addColorStop(0, 'rgba(82,168,236,0.8)');
    g.addColorStop(1, 'rgba(82,168,236,0.2)');
    return g;
  };

  const chartData: ChartDataType = {
    labels,
    datasets: [
      {
        label: 'Order Amount ($)',
        data: labels.map((l) => amountsByCustomer[l]),
        backgroundColor(context: any) {
          const { chartArea, ctx: canvasCtx } = context.chart;
          return chartArea ? getGradient(canvasCtx) : 'rgba(82,168,236,0.6)';
        },
        borderColor: 'rgba(82,168,236,1)',
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(82,168,236,0.8)',
        hoverBorderColor: 'rgba(82,168,236,1)',
        hoverBorderWidth: 2,
      },
    ],
  };

  const chartOptions: ChartOptionsType = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    layout: { 
      padding: { 
        left: isMobile ? 10 : 20, 
        right: isMobile ? 10 : 20, 
        bottom: isMobile ? 15 : 25,
        top: isMobile ? 10 : 20
      } 
    },
    animation: {
      duration: 1200,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { 
          color: '#fff', 
          font: { 
            size: isMobile ? 10 : 12, 
            weight: 'bold' 
          },
          boxWidth: isMobile ? 12 : 16,
          padding: isMobile ? 10 : 15
        },
      },
      title: {
        display: true,
        text: 'Total Order Amount by Customer',
        color: '#fff',
        font: { 
          size: isMobile ? 16 : 20, 
          weight: 'bold', 
          family: theme.typography.fontFamily 
        },
        padding: { bottom: isMobile ? 20 : 30 },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#52a8ec',
        bodyColor: '#fff',
        titleFont: { size: isMobile ? 10 : 12 },
        bodyFont: { size: isMobile ? 10 : 12 },
        padding: isMobile ? 8 : 10,
        callbacks: {
          label: (ctx: any) => `$ ${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { 
          color: '#fff', 
          font: { size: isMobile ? 8 : 9 },
          maxRotation: isMobile ? 45 : 0,
          minRotation: isMobile ? 45 : 0,
          autoSkip: true,
          autoSkipPadding: isMobile ? 15 : 20,
        },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        suggestedMax: maxAmount ? maxAmount * 1.1 : 10,
        ticks: {
          color: 'rgba(255,255,255,0.7)',
          font: { size: isMobile ? 9 : 11 },
          callback: (v: any) => '$ ' + Number(v).toLocaleString(),
          maxTicksLimit: isMobile ? 6 : 8,
        },
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  return (
    <Box
      sx={{
        height: { xs: 350, sm: 400, md: 450 },
        width: '100%',
        p: { xs: 2, sm: 2.5, md: 3 },
        bgcolor: 'rgba(0,0,0,0.7)',
        borderRadius: { xs: 2, sm: 2.5, md: 3 },
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        position: 'relative',
        overflow: 'hidden',
        '::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, rgba(82,168,236,0.12) 0%, rgba(82,168,236,0) 100%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* @ts-ignore */}
      <Bar data={chartData} options={chartOptions} />
    </Box>
  );
};

export default OrdersByCustomerChart;
