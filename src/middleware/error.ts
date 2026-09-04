import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : 'An unexpected internal server error occurred.';

  console.error('[Error Handler Log]:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && !err.isOperational ? { debugError: err.message } : {}),
  });
};
