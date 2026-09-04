import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { AppError } from '../middleware/error';
import { logAudit } from '../services/auditService';

export interface OrderItemDTO {
  productId: string;
  quantity: number;
}

export interface CreateOrderDTO {
  items: OrderItemDTO[];
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
}

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const { items, shippingAddress, recipientName, recipientPhone } = req.body as CreateOrderDTO;

    if (!items || !items.length || !shippingAddress || !recipientName || !recipientPhone) {
      throw new AppError('Order missing required fields: items list, shipping address, recipient name, and phone are required.', 400);
    }

    // Calculate total server-side to prevent price tampering (Security Rule #115)
    let calculatedTotal = 0;
    const itemRecords: { productId: string; quantity: number; unitPrice: number; originDistrict: string }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new AppError(`Product ${item.productId} not found.`, 404);
      }

      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for product "${product.title}". Requested: ${item.quantity}, Available: ${product.stock}.`, 400);
      }

      calculatedTotal += product.price * item.quantity;
      itemRecords.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        originDistrict: product.originDistrict,
      });
    }

    // Execute order creation & stock update in DB transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId: req.user!.id,
          totalAmount: calculatedTotal,
          paymentStatus: 'COMPLETED', // Payment Sandbox Simulation
          orderStatus: 'PLACED',
          shippingAddress,
          recipientName,
          recipientPhone,
          items: {
            create: itemRecords.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            })),
          },
        },
        include: { items: true },
      });

      // Deduct inventory stock
      for (const item of itemRecords) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Automatically create Shipment record
      const originDist = itemRecords[0]?.originDistrict || 'Satara';
      const destDist = shippingAddress.includes('Pune') ? 'Pune' : shippingAddress.includes('Mumbai') ? 'Mumbai' : 'Kolhapur';

      await tx.shipment.create({
        data: {
          orderId: newOrder.id,
          originDistrict: originDist,
          destinationDistrict: destDist,
          trackingStatus: 'PICKUP_REQUESTED',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          trackingHistory: JSON.stringify([
            {
              status: 'PICKUP_REQUESTED',
              location: `${originDist} District Producer Hub`,
              timestamp: new Date().toISOString(),
              note: 'Order placed by customer. Last-mile pickup requested from local producer SHG.',
            },
          ]),
        },
      });

      return newOrder;
    });

    await logAudit(req.user.id, 'ORDER_CREATED', 'Order', order.id, { totalAmount: calculatedTotal });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully via RuralRoute Payment Sandbox.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    let whereClause: any = {};

    if (req.user.role === 'CUSTOMER') {
      whereClause.customerId = req.user.id;
    } else if (req.user.role === 'ENTREPRENEUR') {
      const profile = await prisma.entrepreneurProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (profile) {
        whereClause.items = {
          some: {
            product: { entrepreneurId: profile.id },
          },
        };
      }
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        customer: { select: { name: true, phone: true, email: true } },
        items: {
          include: { product: true },
        },
        shipment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: { entrepreneur: true },
            },
          },
        },
        shipment: {
          include: { partner: { select: { name: true, phone: true } } },
        },
        customer: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
