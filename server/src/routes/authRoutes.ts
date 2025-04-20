// server/src/routes/authRoutes.ts
import { Router } from 'express';
import { 
  register, 
  verifyEmail, 
  login, 
  logout, 
  forgotPassword, 
  resetPassword,
  getProfile 
} from '../controllers/authController';
import { 
  registerValidator, 
  loginValidator, 
  resetPasswordValidator, 
  validateRequest 
} from '../middlewares/validation';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/register', registerValidator, validateRequest, register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginValidator, validateRequest, login);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPasswordValidator, validateRequest, resetPassword);
router.get('/profile', authenticate, getProfile);

export default router;