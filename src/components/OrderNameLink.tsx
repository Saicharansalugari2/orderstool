
import Link from 'next/link'
import { Typography } from '@mui/material'

interface OrderNameLinkProps {
  orderId: string
  orderName: string
}

export default function OrderNameLink({ orderId, orderName }: OrderNameLinkProps) {
  return (
    <Link href={`/orders/${orderId}`} legacyBehavior={false}>
      <Typography
        sx={{
          cursor: 'pointer',
          color: 'primary.main',
          textDecoration: 'underline',
          '&:hover': { color: 'primary.dark' },
        }}
        variant="body1"
      >
        {orderName}
      </Typography>
    </Link>
  );
}
