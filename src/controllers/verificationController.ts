import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { AppError } from '../middleware/error';
import { logAudit } from '../services/auditService';
import qrcode from 'qrcode';

export const getPublicQrVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { qrId } = req.params;

    const batch = await prisma.productBatch.findUnique({
      where: { qrId },
      include: {
        product: {
          include: {
            entrepreneur: {
              select: {
                businessName: true,
                village: true,
                district: true,
                verificationStatus: true,
              },
            },
          },
        },
      },
    });

    if (!batch) {
      throw new AppError('QR Certificate Invalid or Batch Record Not Found.', 404);
    }

    // Generate SVG QR Code data URL dynamically
    const qrDataUrl = await qrcode.toDataURL(`https://ruralroute.in/verify/${qrId}`);

    return res.status(200).json({
      success: true,
      data: {
        qrId: batch.qrId,
        batchNo: batch.batchNo,
        manufactureDate: batch.manufactureDate,
        expiryDate: batch.expiryDate,
        verificationStatus: batch.verificationStatus,
        notes: batch.notes,
        product: {
          id: batch.product.id,
          title: batch.product.title,
          category: batch.product.category,
          originVillage: batch.product.originVillage,
          originDistrict: batch.product.originDistrict,
          story: batch.product.story,
          status: batch.product.status,
          imageUrl: batch.product.imageUrl,
          entrepreneur: batch.product.entrepreneur,
        },
        authenticitySeal: batch.verificationStatus === 'VERIFIED' ? 'AUTHENTIC_RURALROUTE_VERIFIED' : 'UNVERIFIED_PENDING_AUDIT',
        qrImage: qrDataUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const { type, fileName } = req.body;

    if (!type || !fileName) {
      throw new AppError('Document type (e.g. FSSAI, GST, UDYAM, ARTISAN_CARD) and fileName are required.', 400);
    }

    const storageKey = `docs/${req.user.id}_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '')}`;

    const doc = await prisma.document.create({
      data: {
        ownerId: req.user.id,
        type,
        fileName,
        storageKey,
        verificationStatus: 'PENDING',
      },
    });

    await logAudit(req.user.id, 'DOCUMENT_UPLOADED', 'Document', doc.id, { type: doc.type });

    return res.status(201).json({
      success: true,
      message: 'Verification document submitted successfully for admin review.',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyDocuments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const docs = await prisma.document.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: docs,
    });
  } catch (error) {
    next(error);
  }
};
