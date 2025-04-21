// src/contexts/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { User, UserRole, Chat, Message } from '../types';

interface SocketContextProps {
  socket: Socket | null;
  activeRPAs: User[];
  activeAdmins: User[];
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (chatId: string, content: string) => void;
  endChat: (chatId: string) => void;
  setTyping: (chatId: string, isTyping: boolean) => void;
  listenForMessages: (callback: (message: Message) => void) => void;
  listenForTyping: (callback: (data: { userId: string; isTyping: boolean }) => void) => void;
  listenForChatEnded: (callback: (data: { chatId: string }) => void) => void;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeRPAs, setActiveRPAs] = useState<User[]>([]);
  const [activeAdmins, setActiveAdmins] = useState<User[]>([]);

  useEffect(() => {
    if (state.token && !socket) {
      // Connect socket with auth token
      const newSocket = io('http://10.0.2.2:5000', {
        auth: { token: state.token },
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('active-users-updated', (data: { activeRPAs: User[]; activeAdmins: User[] }) => {
        setActiveRPAs(data.activeRPAs);
        setActiveAdmins(data.activeAdmins);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      newSocket.on('error', (error: any) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.disconnect();
      };
    }

    if (!state.token && socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [state.token]);

  const joinChat = (chatId: string) => {
    if (socket) {
      socket.emit('join-chat', chatId);
    }
  };

  const leaveChat = (chatId: string) => {
    if (socket) {
      socket.emit('leave-chat', chatId);
    }
  };

  const sendMessage = (chatId: string, content: string) => {
    if (socket) {
      socket.emit('send-message', { chatId, content });
    }
  };

  const endChat = (chatId: string) => {
    if (socket) {
      socket.emit('end-chat', chatId);
    }
  };

  const setTyping = (chatId: string, isTyping: boolean) => {
    if (socket) {
      socket.emit('typing', { chatId, isTyping });
    }
  };

  const listenForMessages = (callback: (message: Message) => void) => {
    if (socket) {
      socket.on('new-message', callback);
    }

    return () => {
      if (socket) {
        socket.off('new-message');
      }
    };
  };

  const listenForTyping = (callback: (data: { userId: string; isTyping: boolean }) => void) => {
    if (socket) {
      socket.on('user-typing', callback);
    }

    return () => {
      if (socket) {
        socket.off('user-typing');
      }
    };
  };

  const listenForChatEnded = (callback: (data: { chatId: string }) => void) => {
    if (socket) {
      socket.on('chat-ended', callback);
    }

    return () => {
      if (socket) {
        socket.off('chat-ended');
      }
    };
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        activeRPAs,
        activeAdmins,
        joinChat,
        leaveChat,
        sendMessage,
        endChat,
        setTyping,
        listenForMessages,
        listenForTyping,
        listenForChatEnded,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};