import React from 'react';
import { Typography, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useRouter } from 'next/router';
import styles from '@/styles/components/OrderSuccess.module.css';

const OrderSuccess = () => {
  const router = useRouter();

  return (
    <div className={styles.successContainer}>
      <div className={styles.successContent}>
        <CheckCircleIcon className={styles.icon} />
        <Typography variant="h4" className={styles.title}>
          Order Successfully Submitted!
        </Typography>
        <Typography variant="body1" className={styles.description}>
          Your order has been successfully created and is now being processed. Our team will review it shortly and update the status. You can track its progress in the dashboard or check the orders list.
        </Typography>
        <div className={styles.buttonContainer}>
          <button
            className={styles.primaryButton}
            onClick={() => router.push('/orders/list')}
          >
            <ListAltIcon sx={{ mr: 1 }} />
            View Orders List
          </button>
          <button
            className={styles.secondaryButton}
            onClick={() => router.push('/')}
          >
            <DashboardIcon sx={{ mr: 1 }} />
            Go to Dashboard
          </button>
        </div>
      </div>
      
    
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, #52a8ec20 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '8%',
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, #52a8ec15 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          animation: 'float 8s ease-in-out infinite',
          animationDelay: '1s',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: '15%',
          width: '80px',
          height: '80px',
          background: 'radial-gradient(circle, #52a8ec10 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(20px)',
          animation: 'float 7s ease-in-out infinite',
          animationDelay: '2s',
        }}
      />
      
     
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default OrderSuccess; 