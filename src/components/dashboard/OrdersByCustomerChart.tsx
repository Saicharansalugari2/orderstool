/* src/components/dashboard/OrdersByCustomerChart.tsx */

import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { useAppSelector } from '@/store/hooks';
import { Box, useTheme } from '@mui/material';
import type {
  ChartData,
  ChartOptions,
  ScriptableContext,
} from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OrdersByCustomerChart: React.FC = () => {
  const theme = useTheme();
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

  const data: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: 'Order Amount ($)',
        data: labels.map((l) => amountsByCustomer[l]),
        backgroundColor(context: ScriptableContext<'bar'>) {
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

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    layout: { padding: { left: 20, right: 20, bottom: 25 } },
    animation: { duration: 1200, easing: 'easeInOutQuart' },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#fff', font: { size: 12, weight: 'bold' } },
      },
      title: {
        display: true,
        text: 'Total Order Amount by Customer',
        color: '#fff',
        font: { size: 20, weight: 'bold', family: theme.typography.fontFamily },
        padding: { bottom: 30 },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#52a8ec',
        bodyColor: '#fff',
        callbacks: {
          label: (ctx) => `$ ${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#fff', font: { size: 9 } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        suggestedMax: maxAmount ? maxAmount * 1.1 : 10,
        ticks: {
          color: 'rgba(255,255,255,0.7)',
          font: { size: 11 },
          callback: (v) => '$ ' + Number(v).toLocaleString(),
        },
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  return (
    <Box
      sx={{
        height: 450,
        width: '100%',
        p: 3,
        bgcolor: 'rgba(0,0,0,0.7)',
        borderRadius: 3,
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
      <Bar data={data} options={options} />
    </Box>
  );
};

export default OrdersByCustomerChart;
