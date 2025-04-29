import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();
const productController = new ProductController();

// Public routes
router.get('/', productController.getAllProducts.bind(productController));
router.get('/:id', productController.getProduct.bind(productController));
router.get('/category/:categoryId', productController.getProductsByCategory.bind(productController));

// Admin routes
router.post(
  '/',
  authenticateToken,
  authorizeRole(['ADMIN']),
  productController.createProduct.bind(productController)
);
router.put(
  '/:id',
  authenticateToken,
  authorizeRole(['ADMIN']),
  productController.updateProduct.bind(productController)
);
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['ADMIN']),
  productController.deleteProduct.bind(productController)
);
router.put(
  '/:id/stock',
  authenticateToken,
  authorizeRole(['ADMIN']),
  productController.updateStock.bind(productController)
);

export default router;
