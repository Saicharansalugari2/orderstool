import React from 'react';
import { useRouter } from 'next/router';
import OrderForm from '@/components/OrderForm';

export default function ViewOrderPage() {
  const router = useRouter();
  const { orderNumber } = router.query;

  if (!orderNumber || typeof orderNumber !== 'string') {
    return null;
  }

  return <OrderForm mode="view" orderNumber={orderNumber} />;
} 