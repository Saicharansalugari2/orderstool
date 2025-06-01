import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs/promises';
import { Order } from '@/types/order';

const ORDERS_FILE = path.join(process.cwd(), 'data/orders.json');

function normalizeOrderNumber(orderNumber: string | number): string {
  return String(orderNumber).trim().toUpperCase();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const id = query.id as string;

  if (!id) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    const ordersData = await fs.readFile(ORDERS_FILE, 'utf8');
    const orders: Order[] = JSON.parse(ordersData);

    switch (method) {
      case 'GET':
        const order = orders.find(order => 
          normalizeOrderNumber(order.orderNumber) === normalizeOrderNumber(id)
        );

        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }

        return res.status(200).json(order);

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 