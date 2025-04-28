import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();
const productController = new ProductController();

router.post(
  '/',
  authenticateToken,
  authorizeRole(['ADMIN']),
  productController.createProduct.bind(productController)
);
router.get('/:id', productController.getProduct.bind(productController));
router.put(
  '/:id',
  authenticateToken,
  authorizeRole(['ADMIN']),
  productController.updateProduct.bind(productController)
);

export default router;
