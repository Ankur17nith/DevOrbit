import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors.js';

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 400,
  details: any = null,
  req?: Request
): void {
  const requestId = req ? ((req as any).id || (req.headers['x-request-id'] as string) || null) : null;
  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      message,
      statusCode,
      details: details || null,
    },
    message,
    requestId,
  });
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  const requestId = (req as any).id || (req.headers['x-request-id'] as string) || null;

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      data: null,
      error: {
        message: err.message,
        statusCode: err.statusCode,
        details: err.details || null,
      },
      message: err.message,
      requestId,
    });
    return;
  }

  // Map Prisma known request errors
  const prismaCode = (err as any).code;
  if (prismaCode === 'P2002') {
    res.status(409).json({
      success: false,
      data: null,
      error: {
        message: 'A resource with this identifier already exists (Conflict).',
        statusCode: 409,
        details: (err as any).meta || null,
      },
      message: 'A resource with this identifier already exists (Conflict).',
      requestId,
    });
    return;
  }

  if (prismaCode === 'P2025') {
    res.status(404).json({
      success: false,
      data: null,
      error: {
        message: 'The requested resource was not found.',
        statusCode: 404,
        details: (err as any).meta || null,
      },
      message: 'The requested resource was not found.',
      requestId,
    });
    return;
  }

  if (prismaCode === 'P2003') {
    res.status(400).json({
      success: false,
      data: null,
      error: {
        message: 'Referenced foreign relation does not exist.',
        statusCode: 400,
        details: (err as any).meta || null,
      },
      message: 'Referenced foreign relation does not exist.',
      requestId,
    });
    return;
  }

  console.error(`[${new Date().toISOString()}] Unhandled Server Error [req:${requestId}]:`, err);
  const statusCode = (err as any).statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';
  const safeMessage = isProd && statusCode >= 500
    ? 'An unexpected internal server error occurred.'
    : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      message: safeMessage,
      statusCode,
      details: isProd ? null : (err as any).details || null,
      ...(isProd ? {} : { stack: err.stack }),
    },
    message: safeMessage,
    requestId,
  });
}
