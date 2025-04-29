import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();
const categoryController = new CategoryController();

// Public routes
router.get('/', categoryController.getAllCategories.bind(categoryController));
router.get('/:id', categoryController.getCategory.bind(categoryController));

// Admin routes
router.post(
  '/',
  authenticateToken,
  authorizeRole(['ADMIN']),
  categoryController.createCategory.bind(categoryController)
);
router.put(
  '/:id',
  authenticateToken,
  authorizeRole(['ADMIN']),
  categoryController.updateCategory.bind(categoryController)
);
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['ADMIN']),
  categoryController.deleteCategory.bind(categoryController)
);

export default router;