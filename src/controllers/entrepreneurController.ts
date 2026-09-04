import { Response, NextFunction } from 'express';
import { AuthRequest, verifyOwnershipOrAdmin } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { AppError } from '../middleware/error';
import { logAudit } from '../services/auditService';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const profile = await prisma.entrepreneurProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        products: {
          include: { batches: true },
        },
      },
    });

    if (!profile) {
      throw new AppError('Entrepreneur profile not found. Please complete profile registration.', 404);
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const { businessName, village, district, description, contactPhone } = req.body;

    const existingProfile = await prisma.entrepreneurProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!existingProfile) {
      throw new AppError('Entrepreneur profile not found.', 404);
    }

    const updatedProfile = await prisma.entrepreneurProfile.update({
      where: { id: existingProfile.id },
      data: {
        businessName: businessName ?? existingProfile.businessName,
        village: village ?? existingProfile.village,
        district: district ?? existingProfile.district,
        description: description ?? existingProfile.description,
        contactPhone: contactPhone ?? existingProfile.contactPhone,
      },
    });

    await logAudit(req.user.id, 'PROFILE_UPDATED', 'EntrepreneurProfile', updatedProfile.id);

    return res.status(200).json({
      success: true,
      message: 'Entrepreneur business profile updated successfully.',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};
