import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../lib/errors.js';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) (req as any).query = parsed.query;
      if (parsed.params !== undefined) (req as any).params = parsed.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new BadRequestError('Validation error', error.errors));
      } else {
        next(error);
      }
    }
  };
}
