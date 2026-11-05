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

  console.error('Unhandled Server Error:', err);
  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      message: err.message || 'Internal server error',
      statusCode,
      details: null,
    },
    message: err.message || 'Internal server error',
    requestId,
  });
}
