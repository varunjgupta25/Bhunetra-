import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { AppError } from '../middleware/error';
import { logAudit } from '../services/auditService';

export const getShipments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;

    const whereClause: any = {};

    if (status) {
      whereClause.trackingStatus = String(status);
    }

    const shipments = await prisma.shipment.findMany({
      where: whereClause,
      include: {
        order: {
          include: {
            customer: { select: { name: true, phone: true } },
            items: { include: { product: true } },
          },
        },
        partner: { select: { name: true, phone: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: shipments,
    });
  } catch (error) {
    next(error);
  }
};

export const getShipmentByOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;

    const shipment = await prisma.shipment.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            items: { include: { product: true } },
          },
        },
        partner: { select: { name: true, phone: true } },
      },
    });

    if (!shipment) {
      throw new AppError('Shipment record not found for this order.', 404);
    }

    return res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateShipmentStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const { id } = req.params;
    const { trackingStatus, location, note } = req.body;

    if (!trackingStatus) {
      throw new AppError('trackingStatus is required.', 400);
    }

    const existingShipment = await prisma.shipment.findUnique({
      where: { id },
    });

    if (!existingShipment) {
      throw new AppError('Shipment record not found.', 404);
    }

    // Parse existing tracking history
    let history: any[] = [];
    try {
      history = JSON.parse(existingShipment.trackingHistory || '[]');
    } catch (e) {
      history = [];
    }

    const newHistoryEvent = {
      status: trackingStatus,
      location: location || `${existingShipment.originDistrict} Hub`,
      timestamp: new Date().toISOString(),
      note: note || `Shipment status updated to ${trackingStatus} by logistics partner (${req.user.name})`,
    };

    history.push(newHistoryEvent);

    const updatedShipment = await prisma.shipment.update({
      where: { id },
      data: {
        partnerId: req.user.id,
        trackingStatus,
        trackingHistory: JSON.stringify(history),
      },
    });

    // If status is DELIVERED, update parent order status
    if (trackingStatus === 'DELIVERED') {
      await prisma.order.update({
        where: { id: existingShipment.orderId },
        data: { orderStatus: 'DELIVERED' },
      });
    } else if (trackingStatus === 'IN_TRANSIT') {
      await prisma.order.update({
        where: { id: existingShipment.orderId },
        data: { orderStatus: 'IN_TRANSIT' },
      });
    }

    await logAudit(req.user.id, `SHIPMENT_${trackingStatus}`, 'Shipment', id, { location });

    return res.status(200).json({
      success: true,
      message: `Shipment milestone updated to ${trackingStatus}.`,
      data: updatedShipment,
    });
  } catch (error) {
    next(error);
  }
};
