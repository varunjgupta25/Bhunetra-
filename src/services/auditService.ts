import { prisma } from '../db/prisma';

export const logAudit = async (
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: object | string
) => {
  try {
    const detailsString = typeof details === 'object' ? JSON.stringify(details) : details || '';
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        details: detailsString,
      },
    });
  } catch (error) {
    console.error('[Audit Log Error]: Failed to write audit record:', error);
  }
};
