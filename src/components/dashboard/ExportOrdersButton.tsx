
import React from "react";
import { Button } from "@mui/material";
import { useAppSelector } from "@/store/hooks";
import Papa from "papaparse";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { format } from 'date-fns';

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    return 'Invalid Date';
  }
};

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  return `$${Number(amount).toFixed(2)}`;
};

const ExportOrdersButton: React.FC = () => {
  const orders = useAppSelector(state => state.orders.orders);

  const handleExport = () => {
    if (!orders.length) return;

    const csvData = orders.map(order => ({
      OrderNumber: order.orderNumber,
      Customer: order.customer,
      TransactionDate: formatDate(order.transactionDate),
      Status: order.status,
      FromLocation: order.fromLocation,
      ToLocation: order.toLocation,
      Amount: formatCurrency(order.amount).replace('$', ''),
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

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <Button
        variant="contained"
        onClick={handleExport}
        disabled={orders.length === 0}
        endIcon={<FileDownloadIcon sx={{ fontSize: '28px' }} />}
        sx={{
          width: 350,
          height: '48px',
          bgcolor: "#fff",      
          color: "#000",       
          fontWeight: "bold",
          fontSize: '1.1rem',
          borderRadius: "8px",
          border: "1px solid #000",
          textTransform: 'none',
          "&:hover": {
            bgcolor: "#000",     
            color: "#fff",
            transform: 'translateY(-1px)',
            boxShadow: '0 5px 10px rgba(0,0,0,0.2)'
          },
          transition: 'all 0.2s ease'
        }}
      >
        Export AllOrders.csv
      </Button>
    </div>
  );
};

export default ExportOrdersButton;
