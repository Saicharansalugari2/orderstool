
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs/promises';
import { Order } from '@/types/order';

const ORDERS_FILE = path.join(process.cwd(), 'data/orders.json');

function normalizeOrderNumber(orderNumber: string | number): string {
  if (!orderNumber) return '';
  return String(orderNumber).trim().toUpperCase();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  console.log('Body:', req.body);

  try {
    const { method, query } = req;
    const orderNumber = normalizeOrderNumber(query.orderNumber as string);

    const ordersData = await fs.readFile(ORDERS_FILE, 'utf8');
    let orders: Order[] = JSON.parse(ordersData);

    switch (method) {
      case 'GET':
   
        if (orderNumber) {
          const order = orders.find(o => normalizeOrderNumber(o.orderNumber) === orderNumber);
          if (!order) {
            return res.status(404).json({ error: 'Order not found' });
          }
          return res.status(200).json(order);
        }

      
        const orderMap = new Map<string, Order>();
        orders.forEach(order => {
          const normalizedOrder = {
            ...order,
            orderNumber: normalizeOrderNumber(order.orderNumber),
          };
    
          const existingOrder = orderMap.get(normalizedOrder.orderNumber);
          if (!existingOrder || new Date(normalizedOrder.transactionDate) > new Date(existingOrder.transactionDate)) {
            orderMap.set(normalizedOrder.orderNumber, normalizedOrder);
    }
        });
        
        const uniqueOrders = Array.from(orderMap.values());
        res.status(200).json(uniqueOrders);
        break;

      case 'POST':
    try {
          const newOrder: Order = {
            ...req.body,
            orderNumber: normalizeOrderNumber(req.body.orderNumber)
          };
      orders.push(newOrder);
      await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
          res.status(201).json(newOrder);
    } catch (error) {
      console.error('Error saving order:', error);
      res.status(500).json({ error: 'Failed to save order' });
    }
        break;

      case 'PUT':
        if (!orderNumber) {
          return res.status(400).json({ error: 'Order number is required' });
      }

        const { status } = req.body;
        if (!status) {
          return res.status(400).json({ error: 'Status is required' });
        }

    
        const orderIndex = orders.findIndex(order => 
          normalizeOrderNumber(order.orderNumber) === orderNumber
        );

        console.log('Updating order:', {
          orderNumber,
          orderIndex,
          status,
          allOrderNumbers: orders.map(o => normalizeOrderNumber(o.orderNumber))
        });

        if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
      }

        orders[orderIndex] = {
          ...orders[orderIndex],
          status
        };


      await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
        return res.status(200).json(orders[orderIndex]);

      case 'DELETE':
        if (!orderNumber) {
          return res.status(400).json({ error: 'Order number is required' });
      }
  
        orders = orders.filter(order => normalizeOrderNumber(order.orderNumber) !== orderNumber);


      await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
        return res.status(200).json({ message: 'Order deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
