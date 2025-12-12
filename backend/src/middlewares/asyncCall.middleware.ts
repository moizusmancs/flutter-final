import { Request, Response, NextFunction, RequestHandler } from 'express';

export const AsyncCall = (
  givenFn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(givenFn(req, res, next)).catch(next);
  };
};
