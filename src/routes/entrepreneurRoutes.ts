import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/entrepreneurController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['ENTREPRENEUR', 'ADMIN']));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
