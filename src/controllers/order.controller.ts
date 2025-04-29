import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PaymentService } from '../services/payment.service';
import { AuthRequest } from '../middlewares/auth.middleware';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

const prisma = new PrismaClient();
const paymentService = new PaymentService();

export class OrderController {
  async createOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { items, shippingAddress } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Calculate total price
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          res.status(400).json({ error: `Product not found: ${item.productId}` });
          return;
        }

        if (product.stockQuantity < item.quantity) {
          res.status(400).json({ error: `Insufficient stock for product: ${product.name}` });
          return;
        }

        totalAmount += product.price * item.quantity;
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
      }

      const order = await prisma.$transaction(async (prisma) => {
        // Create order
        const newOrder = await prisma.order.create({
          data: {
            userId,
            totalAmount,
            status: 'PENDING',
            shippingAddress,
            items: {
              create: orderItems,
            },
          },
          include: {
            items: true,
          },
        });

        // Update product stock
        for (const item of orderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });
        }

        return newOrder;
      });

      res.status(201).json(order);
    } catch (error) {
      console.error('Failed to create order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }

  async getOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      if (order.userId !== userId && req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Not authorized to view this order' });
        return;
      }

      res.json(order);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  }

  async getMyOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json(orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  async getAllOrders(_req: Request, res: Response): Promise<void> {
    try {
      const orders = await prisma.order.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json(orders);
    } catch (error) {
      console.error('Failed to fetch all orders:', error);
      res.status(500).json({ error: 'Failed to fetch all orders' });
    }
  }

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await prisma.order.update({
        where: { id },
        data: { status },
      });

      res.json(order);
    } catch (error) {
      console.error('Failed to update order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }

  async createPaymentIntent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      if (order.userId !== req.user?.id) {
        res.status(403).json({ error: 'Not authorized to pay for this order' });
        return;
      }

      const paymentIntent = await paymentService.createPaymentIntent({
        amount: order.totalAmount,
        orderId: order.id,
      });

      res.json(paymentIntent);
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  }

  async handlePaymentWebhook(req: Request, res: Response): Promise<void> {
    try {
      const event = await paymentService.constructWebhookEvent(req);
      
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        await prisma.order.update({
          where: { id: paymentIntent.metadata.orderId },
          data: { status: 'PAID' },
        });
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Failed to handle payment webhook:', error);
      res.status(400).json({ error: 'Webhook error' });
    }
  }
}