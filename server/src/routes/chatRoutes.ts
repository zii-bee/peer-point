// server/src/routes/chatRoutes.ts
import { Router } from 'express';
import { 
  createChat,
  endChat,
  getUserChatHistory,
  getRPAChatHistory,
  getChatDetails,
  sendMessage
} from '../controllers/chatController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../types';

const router = Router();

// Create a new chat
router.post('/', authenticate, createChat);

// End a chat
router.patch('/:chatId/end', authenticate, endChat);

// Get user's chat history
router.get('/history', authenticate, getUserChatHistory);

// Get RPA's chat history (admin only)
router.get('/history/rpa/:rpaId', authenticate, authorize([UserRole.ADMIN]), getRPAChatHistory);

// Get chat details
router.get('/:chatId', authenticate, getChatDetails);

// Send a message
router.post('/:chatId/messages', authenticate, sendMessage);

export default router;