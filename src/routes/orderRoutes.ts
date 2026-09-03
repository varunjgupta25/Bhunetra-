import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById } from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

export default router;
