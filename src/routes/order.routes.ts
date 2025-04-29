import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();
const orderController = new OrderController();

// Customer routes
router.post('/', authenticateToken, orderController.createOrder.bind(orderController));
router.get('/my-orders', authenticateToken, orderController.getMyOrders.bind(orderController));
router.get('/:id', authenticateToken, orderController.getOrder.bind(orderController));

// Admin routes
router.get(
  '/admin/all',
  authenticateToken,
  authorizeRole(['ADMIN']),
  orderController.getAllOrders.bind(orderController)
);
router.put(
  '/:id/status',
  authenticateToken,
  authorizeRole(['ADMIN']),
  orderController.updateOrderStatus.bind(orderController)
);

// Payment routes
router.post(
  '/:id/pay',
  authenticateToken,
  orderController.createPaymentIntent.bind(orderController)
);
router.post('/webhook', orderController.handlePaymentWebhook.bind(orderController));

export default router;