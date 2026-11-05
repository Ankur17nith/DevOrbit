import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors.js';

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

  console.error(`[${new Date().toISOString()}] Unhandled Server Error [req:${requestId}]:`, err);
  const statusCode = (err as any).statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';
  const safeMessage = isProd && statusCode === 500
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
