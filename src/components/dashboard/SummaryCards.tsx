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
      label: "Average Order Amount",
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
      spacing={{ xs: 1.5, md: 2 }}
      alignItems="stretch"
      sx={{
        ml: 4,
        mt: 3,
        maxWidth: '98%',
        position: "relative",
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
          sm={6}
          md={3}
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
          }}
          className={hoveredIndex !== index && hoveredIndex !== null ? "cardBlur" : ""}
        >
          <Card
            elevation={4}
            sx={{
              flexGrow: 1,
              minHeight: 100,
              maxWidth: { xs: '100%', sm: '320px' },
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
              px: 4,
              py: 2.25,
              boxShadow: hoveredIndex === index
                      ? `0 15px 30px rgba(0,0,0,0.4), 0 0 15px ${borderGlow}`
                      : "0 6px 15px rgba(0,0,0,0.2)",
              borderColor: hoveredIndex === index 
                        ? borderGlow.replace(", 0.5)", ", 0.8)") 
                        : `${borderGlow.replace(", 0.5)", ", 0.4)")}`,
              cursor: "pointer",
              userSelect: "none",
              transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              transformOrigin: "center",
              transform: hoveredIndex === index ? "scale(1.05) translateY(-5px)" : "scale(1) translateY(0)",
              "&:hover": {
                      borderColor: borderGlow,
                    },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: "16px",
                background: "linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
                opacity: 0,
                transition: "opacity 0.5s ease",
              },
              "&:hover::before": {
                opacity: 1,
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
                  width: hoveredIndex === index ? "80%" : "0%",
                  height: "1px",
                  background: borderGlow,
                  transition: "width 0.3s ease",
        },
      }}
    >
              {React.cloneElement(icon, { 
                sx: { 
                  fontSize: { xs: 26, md: 32 },
                  color: icon.props.sx.color,
                  transition: "transform 0.3s ease",
                  transform: hoveredIndex === index ? "scale(1.1)" : "scale(1)",
                } 
              })}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            letterSpacing: 0.5,
                  color: "#fff",
                  textAlign: "left",
                  textShadow: hoveredIndex === index ? "0 0 8px rgba(255,255,255,0.5)" : "none",
            userSelect: "none",
                  fontSize: { xs: "0.8rem", md: "0.9rem" },
                  transition: "all 0.3s ease",
          }}
        >
          {label}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
                width: "100%",
                mt: 1,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          textAlign="center"
          sx={{
            userSelect: "none",
                  fontSize: { xs: "1.2rem", md: "1.4rem" },
                  color: "#fff",
                  textShadow: hoveredIndex === index ? "0 0 15px rgba(255,255,255,0.5)" : "none",
                  transition: "all 0.3s ease",
          }}
        >
          <CountUp
            end={value}
            prefix={prefix}
            decimals={decimals}
                  duration={12}
            separator=","
          />
        </Typography>
      </Box>
    </Card>
  </Grid>
))}
    </Grid>
  );
};

export default DashboardSummaryCards;
