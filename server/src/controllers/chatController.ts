// server/src/controllers/chatController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { UserRole } from '../types';

// Create a new chat
export const createChat = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { targetUserId, isAnonymous = false } = req.body;
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    let targetUser;

    // If targetUserId is provided, use it (admin initiated chat)
    if (targetUserId) {
      targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        res.status(404).json({ message: 'Target user not found' });
        return;
      }
    } 
    // If user is initiating chat with RPA, find least busy RPA
    else if (currentUser.role === UserRole.USER) {
      const activeRPAs = await User.find({ 
        role: UserRole.RPA,
        isOnline: true 
      })
      .sort({ currentChats: 1 })
      .limit(1);

      if (activeRPAs.length === 0) {
        res.status(404).json({ message: 'No RPAs available at the moment' });
        return;
      }

      targetUser = activeRPAs[0];
    } else {
      res.status(400).json({ message: 'Invalid chat request' });
      return;
    }

    // Create the chat
    const chat = new Chat({
      participants: [
        {
          userId: currentUser._id,
          role: currentUser.role,
          isAnonymous: currentUser.role === UserRole.USER ? isAnonymous : false
        },
        {
          userId: targetUser._id,
          role: targetUser.role,
          isAnonymous: false
        }
      ],
      isActive: true
    });

    await chat.save();

    // Update current chats count for both users
    currentUser.currentChats += 1;
    await currentUser.save();

    targetUser.currentChats += 1;
    await targetUser.save();

    res.status(201).json({ 
      chat: {
        id: chat._id,
        participants: chat.participants.map(p => ({
          userId: p.userId,
          role: p.role,
          isAnonymous: p.isAnonymous
        })),
        isActive: chat.isActive,
        createdAt: chat.createdAt
      }
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// End a chat
export const endChat = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(
      p => p.userId.toString() === req.user?.id
    );

    if (!isParticipant && req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Unauthorized access' });
      return;
    }

    // Update chat status
    chat.isActive = false;
    await chat.save();

    // Update current chats count for participants
    for (const participant of chat.participants) {
      const user = await User.findById(participant.userId);
      if (user) {
        user.currentChats = Math.max(0, user.currentChats - 1);
        await user.save();
      }
    }

    res.status(200).json({ message: 'Chat ended successfully' });
  } catch (error) {
    console.error('End chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's chat history
export const getUserChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({
      'participants.userId': new mongoose.Types.ObjectId(req.user.id)
    })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'participants.userId',
      select: 'name email role'
    })
    .populate({
      path: 'messages',
      options: { sort: { timestamp: 1 } }
    });

    const totalChats = await Chat.countDocuments({
      'participants.userId': new mongoose.Types.ObjectId(req.user.id)
    });

    res.status(200).json({ 
      chats, 
      pagination: {
        page,
        limit,
        totalChats,
        totalPages: Math.ceil(totalChats / limit)
      }
    });
  } catch (error) {
    console.error('Get user chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get RPA's chat history (admin only)
export const getRPAChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { rpaId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({
      'participants.userId': new mongoose.Types.ObjectId(rpaId)
    })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'participants.userId',
      select: 'name email role'
    })
    .populate({
      path: 'messages',
      options: { sort: { timestamp: 1 } }
    });

    const totalChats = await Chat.countDocuments({
      'participants.userId': new mongoose.Types.ObjectId(rpaId)
    });

    res.status(200).json({ 
      chats, 
      pagination: {
        page,
        limit,
        totalChats,
        totalPages: Math.ceil(totalChats / limit)
      }
    });
  } catch (error) {
    console.error('Get RPA chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get chat details
export const getChatDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .populate({
        path: 'participants.userId',
        select: 'name email role isOnline'
      })
      .populate({
        path: 'messages',
        options: { sort: { timestamp: 1 } }
      });

    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    // Check if user is a participant or an admin
    const isParticipant = chat.participants.some(
      p => (p.userId as any)._id?.toString() === req.user?.id || p.userId.toString() === req.user?.id
    );

    if (!isParticipant && req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Unauthorized access' });
      return;
    }

    res.status(200).json({ chat });
  } catch (error) {
    console.error('Get chat details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a message
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { chatId } = req.params;
    const { content } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    if (!chat.isActive) {
      res.status(400).json({ message: 'Cannot send message to inactive chat' });
      return;
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(
      p => p.userId.toString() === req.user?.id
    );

    if (!isParticipant && req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Unauthorized access' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Create message
    const message = new Message({
      chatId: chat._id,
      sender: user._id,
      senderRole: user.role,
      content
    });

    await message.save();

    // Add message to chat
    chat.messages.push(message._id);
    await chat.save();

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};