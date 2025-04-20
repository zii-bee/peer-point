// server/src/middlewares/validation.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

export const registerValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email')
    .isEmail().withMessage('Valid email is required')
    .custom(value => {
      if (!value.endsWith('@nyu.edu')) {
        throw new Error('Email must be an NYU email address (@nyu.edu)');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

export const resetPasswordValidator = [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];