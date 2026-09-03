import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { AppError } from '../middleware/error';
import { logAudit } from '../services/auditService';

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const { orderId, productId, rating, comment } = req.body;

    if (!orderId || !productId || !rating || !comment) {
      throw new AppError('orderId, productId, rating (1-5), and comment are required.', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    if (order.customerId !== req.user.id) {
      throw new AppError('Unauthorized. You can only review products from your own orders.', 403);
    }

    const itemOrdered = order.items.find((i) => i.productId === productId);
    if (!itemOrdered) {
      throw new AppError('Product was not part of this order.', 400);
    }

    const review = await prisma.review.create({
      data: {
        orderId,
        productId,
        customerId: req.user.id,
        rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
        comment,
      },
    });

    await logAudit(req.user.id, 'REVIEW_CREATED', 'Review', review.id, { productId, rating });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your product review has been submitted.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
