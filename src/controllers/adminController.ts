import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { AppError } from '../middleware/error';
import { logAudit } from '../services/auditService';

export const getPendingVerifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const pendingProducts = await prisma.product.findMany({
      where: { status: 'PENDING' },
      include: {
        entrepreneur: true,
        batches: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingDocuments = await prisma.document.findMany({
      where: { verificationStatus: 'PENDING' },
      include: {
        owner: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingProfiles = await prisma.entrepreneurProfile.findMany({
      where: { verificationStatus: 'PENDING' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: {
        products: pendingProducts,
        documents: pendingDocuments,
        profiles: pendingProfiles,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const { id } = req.params;
    const { status, reviewerNote } = req.body;

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      throw new AppError('Status must be VERIFIED or REJECTED.', 400);
    }

    const product = await prisma.product.update({
      where: { id },
      data: { status },
    });

    // Update associated batch verification status
    await prisma.productBatch.updateMany({
      where: { productId: id },
      data: {
        verificationStatus: status,
        notes: reviewerNote || `Product ${status} by verification admin (${req.user.name})`,
      },
    });

    await logAudit(req.user.id, `PRODUCT_${status}`, 'Product', id, { reviewerNote });

    return res.status(200).json({
      success: true,
      message: `Product verification status updated to ${status}.`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const { id } = req.params;
    const { status, reviewerNote } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new AppError('Document status must be APPROVED or REJECTED.', 400);
    }

    const doc = await prisma.document.update({
      where: { id },
      data: {
        verificationStatus: status,
        reviewerNote: reviewerNote || `Verified by Admin ${req.user.name}`,
      },
    });

    await logAudit(req.user.id, `DOCUMENT_${status}`, 'Document', id, { reviewerNote });

    return res.status(200).json({
      success: true,
      message: `Document status updated to ${status}.`,
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        actor: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalEntrepreneurs = await prisma.entrepreneurProfile.count();
    const totalProducts = await prisma.product.count();
    const verifiedProducts = await prisma.product.count({ where: { status: 'VERIFIED' } });
    const pendingVerifications = await prisma.product.count({ where: { status: 'PENDING' } });
    const totalOrders = await prisma.order.count();

    const ordersSum = await prisma.order.aggregate({
      _sum: { totalAmount: true },
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalEntrepreneurs,
        totalProducts,
        verifiedProducts,
        pendingVerifications,
        totalOrders,
        totalGmv: ordersSum._sum.totalAmount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
