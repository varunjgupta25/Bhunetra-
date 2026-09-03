import { Router } from 'express';
import {
  getShipments,
  getShipmentByOrder,
  updateShipmentStatus,
} from '../controllers/shipmentController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getShipments);
router.get('/order/:orderId', getShipmentByOrder);
router.patch('/:id/status', requireRole(['LOGISTICS', 'ADMIN']), updateShipmentStatus);

export default router;
