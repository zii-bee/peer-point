// server/src/routes/userRoutes.ts
import { Router } from 'express';
import { 
  getAllUsers, 
  getAllRPAs, 
  getActiveRPAs, 
  getActiveAdmins, 
  updateUserRole 
} from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../types';

const router = Router();

// Get all users (admin only)
router.get('/', authenticate, authorize([UserRole.ADMIN]), getAllUsers);

// Get all RPAs
router.get('/rpas', authenticate, getAllRPAs);

// Get active RPAs
router.get('/rpas/active', authenticate, getActiveRPAs);

// Get active admins
router.get('/admins/active', authenticate, getActiveAdmins);

// Update user role (admin only)
router.patch('/:userId/role', authenticate, authorize([UserRole.ADMIN]), updateUserRole);

export default router;