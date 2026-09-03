import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/error';

import authRoutes from './routes/authRoutes';
import entrepreneurRoutes from './routes/entrepreneurRoutes';
import productRoutes from './routes/productRoutes';
import brandingRoutes from './routes/brandingRoutes';
import verificationRoutes from './routes/verificationRoutes';
import adminRoutes from './routes/adminRoutes';
import orderRoutes from './routes/orderRoutes';
import shipmentRoutes from './routes/shipmentRoutes';
import reviewRoutes from './routes/reviewRoutes';

const app = express();

// Security Headers
app.use(helmet());

// CORS Policy
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

app.use('/api', apiLimiter);

// Request Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'RuralRoute Backend Ecosystem API',
    status: 'ONLINE',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/entrepreneur', entrepreneurRoutes);
app.use('/api/products', productRoutes);
app.use('/api/branding', brandingRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/reviews', reviewRoutes);

// Static Uploads Folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found.`,
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = parseInt(env.PORT, 10) || 5000;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 RuralRoute Backend Server active on port ${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

export default app;
