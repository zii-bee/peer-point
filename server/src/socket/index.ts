// server/src/socket/index.ts
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { DecodedToken } from '../types';
import User from '../models/User';
import Chat from '../models/Chat';
import Message from '../models/Message';

interface ExtendedSocket extends Socket {
  userId?: string;
}

export const setupSocketIO = (server: HttpServer): void => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket: ExtendedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as DecodedToken;

      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket: ExtendedSocket) => {
    console.log(`User connected: ${socket.userId}`);
    
    if (socket.userId) {
      // Update user online status
      await User.findByIdAndUpdate(socket.userId, { isOnline: true });
      
      // Join user's personal room
      socket.join(socket.userId);
      
      // Emit updated active users list
      emitActiveUsers(io);
    }

    // Join chat room
    socket.on('join-chat', async (chatId: string) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        const isParticipant = chat.participants.some(
          p => p.userId.toString() === socket.userId
        );

        if (!isParticipant) {
          const user = await User.findById(socket.userId);
          if (!user || user.role !== 'admin') {
            socket.emit('error', { message: 'Unauthorized access' });
            return;
          }
        }

        socket.join(chatId);
        socket.emit('joined-chat', { chatId });
      } catch (error) {
        console.error('Join chat error:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Leave chat room
    socket.on('leave-chat', (chatId: string) => {
      socket.leave(chatId);
    });

    // Send message
    socket.on('send-message', async (data: { chatId: string; content: string }) => {
      try {
        const { chatId, content } = data;
        
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.isActive) {
          socket.emit('error', { message: 'Cannot send message to inactive chat' });
          return;
        }

        const user = await User.findById(socket.userId);
        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        // Create message
        const message = new Message({
          chatId,
          sender: user._id,
          senderRole: user.role,
          content
        });

        await message.save();

        // Add message to chat
        chat.messages.push(message._id);
        await chat.save();

        // Populate message with sender info
        const populatedMessage = await Message.findById(message._id).populate({
          path: 'sender',
          select: 'name email role'
        });

        // Emit message to chat room
        io.to(chatId).emit('new-message', populatedMessage);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // End chat
    socket.on('end-chat', async (chatId: string) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
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

        // Notify chat participants
        io.to(chatId).emit('chat-ended', { chatId });
        
        // Update active users list
        emitActiveUsers(io);
      } catch (error) {
        console.error('End chat error:', error);
        socket.emit('error', { message: 'Failed to end chat' });
      }
    });

    // Typing indicator
    socket.on('typing', (data: { chatId: string; isTyping: boolean }) => {
      const { chatId, isTyping } = data;
      socket.to(chatId).emit('user-typing', { userId: socket.userId, isTyping });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      if (socket.userId) {
        // Update user online status
        await User.findByIdAndUpdate(socket.userId, { isOnline: false });
        
        // Find active chats and end them
        const activeChats = await Chat.find({
          'participants.userId': socket.userId,
          isActive: true
        });

        for (const chat of activeChats) {
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

          // Notify chat participants
          io.to(chat._id.toString()).emit('chat-ended', { chatId: chat._id });
        }
        
        // Update active users list
        emitActiveUsers(io);
      }
    });
  });

  // Function to emit active users list
  const emitActiveUsers = async (io: Server): Promise<void> => {
    try {
      const activeRPAs = await User.find({ 
        role: 'rpa',
        isOnline: true 
      })
      .select('name email role currentChats');
      
      const activeAdmins = await User.find({ 
        role: 'admin',
        isOnline: true 
      })
      .select('name email role');
      
      io.emit('active-users-updated', { activeRPAs, activeAdmins });
    } catch (error) {
      console.error('Emit active users error:', error);
    }
  };
};