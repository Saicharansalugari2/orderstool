import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { useAppSelector } from "@/store/hooks";
import { Box, useTheme } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  ScriptableContext,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OrdersByCustomerChart: React.FC = () => {
  const theme = useTheme();
  const orders = useAppSelector((state) => state.orders.orders);

  const { amountsByCustomer, maxAmount } = useMemo(() => {
    const amounts = orders.reduce<Record<string, number>>((acc, order) => {
      if (order.customer) {
        acc[order.customer] = (acc[order.customer] || 0) + (order.amount || 0);
      }
      return acc;
    }, {});
    
    // Convert Object.values to number[] explicitly and handle empty case
    const amountValues = Object.values(amounts) as number[];
    const max = amountValues.length > 0 ? Math.max(...amountValues) : 0;
    
    return { amountsByCustomer: amounts, maxAmount: max };
  }, [orders]);

  const labels = Object.keys(amountsByCustomer);
  
  // Generated gradient for bars
  const getGradient = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(82, 168, 236, 0.8)');
    gradient.addColorStop(1, 'rgba(82, 168, 236, 0.2)');
    return gradient;
  };

  const data: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: "Order Amount ($)",
        data: labels.map((label) => amountsByCustomer[label]),
        backgroundColor: function(context: ScriptableContext<"bar">) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(82, 168, 236, 0.6)';
          return getGradient(ctx);
        },
        borderColor: "rgba(82, 168, 236, 1)",
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(82, 168, 236, 0.8)",
        hoverBorderColor: "rgba(82, 168, 236, 1)",
        hoverBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: "easeInOutQuart" as const,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#fff",
          font: {
            size: 12,
            weight: "bold",
          },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "Total Order Amount by Customer",
        font: { 
          size: 20,
          weight: "bold",
          family: theme.typography.fontFamily,
        },
        color: "#fff",
        padding: { bottom: 30 },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#52a8ec",
        bodyColor: "#fff",
        bodyFont: {
          size: 14,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: { parsed: { y: number } }) {
            return `$ ${context.parsed.y.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        ticks: { 
          color: "#ffffff",
          font: {
            size: 9,
          },
          maxRotation: 0,
          minRotation: 0,
        },
        grid: { 
          color: "rgba(255, 255, 255, 0.1)",
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: maxAmount * 1.1, 
        ticks: { 
          color: "rgba(255, 255, 255, 0.7)",
          font: {
            size: 11,
          },
          callback: function(value: number) {
            return '$ ' + value.toLocaleString();
          },
        },
        grid: { 
          color: "rgba(255, 255, 255, 0.1)",
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    layout: {
      padding: {
        left: 20,
        right: 20,
        bottom: 25, 
      },
    },
  };

  return (
    <Box
  sx={{
        height: 450,
        width: '100%',
        maxWidth: '100%',
        ml: 0,
        mr: 0,
    my: 4,
        p: 3,
        bgcolor: "rgba(0, 0, 0, 0.7)",
        borderRadius: 3,
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, rgba(82, 168, 236, 0.1) 0%, rgba(82, 168, 236, 0) 100%)",
          pointerEvents: "none",
        },
  }}
>
  <Bar data={data} options={options} />
</Box>
  );
};

export default OrdersByCustomerChart;
