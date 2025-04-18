import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';

export const validateTaskCreation = (req: Request, res: Response, next: NextFunction): void => {
  const { title } = req.body;
  
  if (!title) {
    next(new AppError('Title is required', 400));
    return;
  }
  
  if (title.length < 3) {
    next(new AppError('Title must be at least 3 characters long', 400));
    return;
  }
  
  next();
};

export const validateTaskUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { title } = req.body;
  
  if (title && title.length < 3) {
    next(new AppError('Title must be at least 3 characters long', 400));
    return;
  }
  
  next();
}; 