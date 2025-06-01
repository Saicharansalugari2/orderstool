import React, { useState } from "react";
import { Grid, Card, Typography, Box } from "@mui/material";
import CountUp from "react-countup";
import { useAppSelector } from "@/store/hooks";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PeopleIcon from "@mui/icons-material/People";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CancelIcon from "@mui/icons-material/Cancel";

const ORDER_STATUSES = {
  PENDING: "Pending",
  APPROVED: "Approved",
  SHIPPED: "Shipped",
  CANCELLED: "Cancelled",
} as const;

const DashboardSummaryCards: React.FC = () => {
  const orders = useAppSelector((state) => state.orders.orders);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, order) => {
    const amount = typeof order.amount === "number" ? order.amount : 0;
    return sum + amount;
  }, 0);
  const avgAmount = totalOrders > 0 ? totalAmount / totalOrders : 0;
  const uniqueCustomers = new Set(orders.map((order) => order.customer)).size;

  const statusCounts = {
    [ORDER_STATUSES.PENDING]: orders.filter((o) => o.status === ORDER_STATUSES.PENDING).length,
    [ORDER_STATUSES.APPROVED]: orders.filter((o) => o.status === ORDER_STATUSES.APPROVED).length,
    [ORDER_STATUSES.SHIPPED]: orders.filter((o) => o.status === ORDER_STATUSES.SHIPPED).length,
    [ORDER_STATUSES.CANCELLED]: orders.filter((o) => o.status === ORDER_STATUSES.CANCELLED).length,
  };

  const cardData = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: <ShoppingCartIcon aria-label="Total Orders" sx={{ fontSize: { xs: 30, md: 40 }, color: "#52a8ec" }} />,
      prefix: "",
      xs: 12,
      sm: 6,
      md: 4,
      gradient: "linear-gradient(135deg, rgba(82, 168, 236, 0.15) 0%, rgba(82, 168, 236, 0.05) 100%)",
      borderGlow: "rgba(82, 168, 236, 0.5)",
    },
    {
      label: "Total Amount",
      value: totalAmount,
      icon: <MonetizationOnIcon aria-label="Total Amount" sx={{ fontSize: { xs: 28, md: 38 }, color: "#4caf50" }} />,
      prefix: "$",
      decimals: 2,
      xs: 12,
      sm: 6,
      md: 4,
      gradient: "linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%)",
      borderGlow: "rgba(76, 175, 80, 0.5)",
    },
    {
      label: "Average Order",
      value: avgAmount,
      icon: <MonetizationOnIcon aria-label="Average Order Amount" sx={{ fontSize: { xs: 28, md: 38 }, color: "#ff9800" }} />,
      prefix: "$",
      decimals: 2,
      xs: 12,
      sm: 6,
      md: 4,
      gradient: "linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 152, 0, 0.05) 100%)",
      borderGlow: "rgba(255, 152, 0, 0.5)",
    },
    {
      label: "Unique Customers",
      value: uniqueCustomers,
      icon: <PeopleIcon aria-label="Unique Customers" sx={{ fontSize: { xs: 28, md: 38 }, color: "#e91e63" }} />,
      prefix: "",
      xs: 12,
      sm: 6,
      md: 4,
      gradient: "linear-gradient(135deg, rgba(233, 30, 99, 0.15) 0%, rgba(233, 30, 99, 0.05) 100%)",
      borderGlow: "rgba(233, 30, 99, 0.5)",
    },
    {
      label: "Pending Orders",
      value: statusCounts[ORDER_STATUSES.PENDING],
      icon: <HourglassTopIcon aria-label="Pending Orders" sx={{ fontSize: { xs: 28, md: 38 }, color: "#ff9800" }} />,
      xs: 12,
      sm: 6,
      md: 4,
      gradient: "linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 152, 0, 0.05) 100%)",
      borderGlow: "rgba(255, 152, 0, 0.5)",
    },
    {
      label: "Approved Orders",
      value: statusCounts[ORDER_STATUSES.APPROVED],
      icon: <CheckCircleIcon aria-label="Approved Orders" sx={{ fontSize: { xs: 28, md: 38 }, color: "#4caf50" }} />,
      xs: 12,
      sm: 6,
      md: 4,
      gradient: "linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%)",
      borderGlow: "rgba(76, 175, 80, 0.5)",
    },
    {
      label: "Shipped Orders",
      value: statusCounts[ORDER_STATUSES.SHIPPED],
      icon: <LocalShippingIcon aria-label="Shipped Orders" sx={{ fontSize: { xs: 28, md: 38 }, color: "#52a8ec" }} />,
      xs: 12,
      sm: 6,
      md: 4,
      gradient: "linear-gradient(135deg, rgba(82, 168, 236, 0.15) 0%, rgba(82, 168, 236, 0.05) 100%)",
      borderGlow: "rgba(82, 168, 236, 0.5)",
    },
    {
      label: "Cancelled Orders",
      value: statusCounts[ORDER_STATUSES.CANCELLED],
      icon: <CancelIcon aria-label="Cancelled Orders" sx={{ fontSize: { xs: 28, md: 38 }, color: "#f44336" }} />,
      xs: 12,
      sm: 6,
      md: 4,
      gradient: "linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(244, 67, 54, 0.05) 100%)",
      borderGlow: "rgba(244, 67, 54, 0.5)",
    },
  ];

  return (
    <Grid
      container
      spacing={{ xs: 3, md: 4 }}
      alignItems="stretch"
      sx={{
        ml: 0,
        mt: 3,
        maxWidth: '100%',
        position: "relative",
        px: 2,
        justifyContent: 'center',
        gap: { xs: 2, md: 3 },
        "& .cardBlur": {
          filter: hoveredIndex !== null ? "blur(4px) brightness(0.6)" : "none",
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          pointerEvents: hoveredIndex !== null ? "none" : "auto",
          userSelect: hoveredIndex !== null ? "none" : "auto",
        },
      }}
    >
      {cardData.map(({ label, value, prefix = "", decimals = 0, icon, gradient, borderGlow }, index) => (
        <Grid
          item
          xs={12}
          sm={5.5}
          md={2.6}
          key={label}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            position: "relative",
            zIndex: hoveredIndex === index ? 10 : 1,
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            mx: { xs: 0, sm: 1, md: 1.5 },
          }}
          className={hoveredIndex !== index && hoveredIndex !== null ? "cardBlur" : ""}
        >
          <Card
            elevation={4}
            sx={{
              flexGrow: 1,
              minHeight: 120,
              maxWidth: { xs: '100%', sm: '340px' },
              minWidth: { xs: '100%', sm: '280px' },
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
              px: 5,
              py: 2,
              boxShadow: `0 15px 30px rgba(0,0,0,0.4), 0 0 15px ${borderGlow}`,
              borderColor: borderGlow.replace(", 0.5)", ", 0.8)"),
              cursor: "pointer",
              userSelect: "none",
              transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              transformOrigin: "center",
              transform: "scale(1.05) translateY(-5px)",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: "16px",
                background: "linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
                opacity: 1,
              },
            }}
          >
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              gap={3}
              mb={2}
              width="100%"
              sx={{
                position: "relative",
                flexDirection: "row",
                textAlign: "center",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -3,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "80%",
                  height: "1px",
                  background: borderGlow,
                },
              }}
            >
              {React.cloneElement(icon, { 
                sx: { 
                  fontSize: { xs: 24, md: 30 },
                  color: icon.props.sx.color,
                  transform: "scale(1.1)",
                } 
              })}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.85rem', md: '0.95rem' },
                  letterSpacing: 0.5,
                }}
              >
                {label}
              </Typography>
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                letterSpacing: 1,
              }}
            >
              <CountUp
                start={0}
                end={value}
                prefix={prefix}
                decimals={decimals}
                duration={2}
                separator=","
              />
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardSummaryCards;
