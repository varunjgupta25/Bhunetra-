import { Router } from 'express';
import {
  getPublicQrVerification,
  uploadDocument,
  getMyDocuments,
} from '../controllers/verificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public QR Verification Route
router.get('/qr/:qrId', getPublicQrVerification);

// Protected Verification Document Routes
router.post('/documents', authenticateToken, uploadDocument);
router.get('/documents', authenticateToken, getMyDocuments);

export default router;
