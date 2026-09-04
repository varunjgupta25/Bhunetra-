import { Router } from 'express';
import {
  getPendingVerifications,
  verifyProduct,
  verifyDocument,
  getAuditLogs,
  getStats,
} from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.get('/pending', getPendingVerifications);
router.post('/verify-product/:id', verifyProduct);
router.post('/verify-document/:id', verifyDocument);
router.get('/audit-logs', getAuditLogs);
router.get('/stats', getStats);

export default router;
