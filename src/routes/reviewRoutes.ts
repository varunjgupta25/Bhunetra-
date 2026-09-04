import { Router } from 'express';
import { createReview, getProductReviews } from '../controllers/reviewController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', authenticateToken, createReview);

export default router;
