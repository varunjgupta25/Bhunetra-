import { Router } from 'express';
import { generateBranding } from '../controllers/brandingController';

const router = Router();

router.post('/generate', generateBranding);

export default router;
