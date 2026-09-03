import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Public Routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected Routes (Entrepreneur / Admin)
router.post('/', authenticateToken, requireRole(['ENTREPRENEUR', 'ADMIN']), createProduct);
router.put('/:id', authenticateToken, requireRole(['ENTREPRENEUR', 'ADMIN']), updateProduct);
router.delete('/:id', authenticateToken, requireRole(['ENTREPRENEUR', 'ADMIN']), deleteProduct);

export default router;
