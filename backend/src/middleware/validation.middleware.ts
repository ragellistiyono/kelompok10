import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';

export const validateUserCreation = (req: Request, res: Response, next: NextFunction): void => {
  const { email, name } = req.body;
  
  if (!email) {
    next(new AppError('Email is required', 400));
    return;
  }
  
  // Validasi format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    next(new AppError('Invalid email format', 400));
    return;
  }
  
  next();
};

export const validateUserUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { email } = req.body;
  
  if (email) {
    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      next(new AppError('Invalid email format', 400));
      return;
    }
  }
  
  next();
};

export const validateIdParam = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;
  
  if (isNaN(Number(id))) {
    next(new AppError('Invalid ID format', 400));
    return;
  }
  
  next();
}; 