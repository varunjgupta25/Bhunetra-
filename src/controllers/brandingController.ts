import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { generateBrandingContent } from '../services/brandingService';
import { logAudit } from '../services/auditService';

export const generateBranding = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, category, village, district, keyFeatures, rawStory } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required to generate branding copy.',
      });
    }

    const brandingOutput = await generateBrandingContent({
      title,
      category,
      village: village || 'Mahabaleshwar',
      district: district || 'Satara',
      keyFeatures,
      rawStory,
    });

    if (req.user) {
      await logAudit(req.user.id, 'AI_BRANDING_GENERATED', 'Product', title);
    }

    return res.status(200).json({
      success: true,
      data: brandingOutput,
    });
  } catch (error) {
    next(error);
  }
};
