import { Request, Response, NextFunction } from 'express';
import { AuthRequest, verifyOwnershipOrAdmin } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { AppError } from '../middleware/error';
import { logAudit } from '../services/auditService';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, district, status, entrepreneurId } = req.query;

    const whereClause: any = {};

    if (status) {
      whereClause.status = String(status);
    } else {
      // Default marketplace view shows verified products only
      whereClause.status = 'VERIFIED';
    }

    if (category) {
      whereClause.category = String(category);
    }

    if (district) {
      whereClause.originDistrict = String(district);
    }

    if (entrepreneurId) {
      whereClause.entrepreneurId = String(entrepreneurId);
      // When filtering by specific entrepreneur, show all statuses if authorized
      delete whereClause.status;
    }

    if (search) {
      const searchStr = String(search);
      whereClause.OR = [
        { title: { contains: searchStr } },
        { description: { contains: searchStr } },
        { originVillage: { contains: searchStr } },
        { originDistrict: { contains: searchStr } },
        { story: { contains: searchStr } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        entrepreneur: {
          select: {
            businessName: true,
            village: true,
            district: true,
            verificationStatus: true,
          },
        },
        batches: {
          where: { verificationStatus: 'VERIFIED' },
          take: 1,
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        entrepreneur: {
          select: {
            id: true,
            businessName: true,
            village: true,
            district: true,
            description: true,
            verificationStatus: true,
            contactPhone: true,
          },
        },
        batches: true,
        reviews: {
          include: {
            customer: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const profile = await prisma.entrepreneurProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      throw new AppError('Only registered entrepreneurs with a valid business profile can list products.', 403);
    }

    const { title, description, category, price, stock, originVillage, originDistrict, story, imageUrl, batchNo, manufactureDate } = req.body;

    if (!title || !description || !category || price === undefined) {
      throw new AppError('Required product fields missing: title, description, category, and price are required.', 400);
    }

    const product = await prisma.product.create({
      data: {
        entrepreneurId: profile.id,
        title,
        description,
        category,
        price: parseFloat(price),
        stock: parseInt(stock || '10', 10),
        originVillage: originVillage || profile.village,
        originDistrict: originDistrict || profile.district,
        story: story || 'Authentic rural product handcrafted in Maharashtra.',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
        status: 'PENDING',
      },
    });

    // Generate initial ProductBatch record
    const batchNumber = batchNo || `BATCH-${title.substring(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const qrIdentifier = `${originDistrict.substring(0, 4).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const batch = await prisma.productBatch.create({
      data: {
        productId: product.id,
        batchNo: batchNumber,
        manufactureDate: manufactureDate || new Date().toISOString().split('T')[0],
        qrId: qrIdentifier,
        verificationStatus: 'PENDING',
        notes: 'Initial production batch submitted for verification.',
      },
    });

    await logAudit(req.user.id, 'PRODUCT_CREATED', 'Product', product.id, { batchNo: batch.batchNo });

    return res.status(201).json({
      success: true,
      message: 'Product listed successfully and submitted for admin quality verification.',
      data: {
        ...product,
        batches: [batch],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { entrepreneur: true },
    });

    if (!existingProduct) {
      throw new AppError('Product not found.', 404);
    }

    if (!verifyOwnershipOrAdmin(existingProduct.entrepreneur.userId, req.user)) {
      throw new AppError('Unauthorized. You can only update products owned by your profile.', 403);
    }

    const { title, description, category, price, stock, originVillage, originDistrict, story, imageUrl, status } = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title: title ?? existingProduct.title,
        description: description ?? existingProduct.description,
        category: category ?? existingProduct.category,
        price: price !== undefined ? parseFloat(price) : existingProduct.price,
        stock: stock !== undefined ? parseInt(stock, 10) : existingProduct.stock,
        originVillage: originVillage ?? existingProduct.originVillage,
        originDistrict: originDistrict ?? existingProduct.originDistrict,
        story: story ?? existingProduct.story,
        imageUrl: imageUrl ?? existingProduct.imageUrl,
        // Status can only be directly mutated by ADMIN
        status: req.user.role === 'ADMIN' && status ? status : existingProduct.status,
      },
    });

    await logAudit(req.user.id, 'PRODUCT_UPDATED', 'Product', id);

    return res.status(200).json({
      success: true,
      message: 'Product details updated successfully.',
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { entrepreneur: true },
    });

    if (!existingProduct) {
      throw new AppError('Product not found.', 404);
    }

    if (!verifyOwnershipOrAdmin(existingProduct.entrepreneur.userId, req.user)) {
      throw new AppError('Unauthorized to delete this product listing.', 403);
    }

    await prisma.product.delete({ where: { id } });

    await logAudit(req.user.id, 'PRODUCT_DELETED', 'Product', id);

    return res.status(200).json({
      success: true,
      message: 'Product listing removed.',
    });
  } catch (error) {
    next(error);
  }
};
