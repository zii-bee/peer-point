// server/src/types/index.ts

import mongoose from 'mongoose';

export enum UserRole {
    USER = 'user',
    RPA = 'rpa',
    ADMIN = 'admin'
  }
  
  export interface IUser {
    _id?: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isEmailVerified: boolean;
    verificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    isOnline: boolean;
    currentChats: number;
  }
  
  export interface IChat {
    _id?: mongoose.Types.ObjectId; // Make optional and use ObjectId type
    participants: Array<{
      userId: mongoose.Types.ObjectId | string; // Allow both types for flexibility
      role: UserRole;
      isAnonymous: boolean;
    }>;
    messages: mongoose.Types.ObjectId[] | string[]; // Allow both types for flexibility
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
  }
  
  export interface IMessage {
    _id?: mongoose.Types.ObjectId;
    chatId: mongoose.Types.ObjectId | string;
    sender: mongoose.Types.ObjectId | string;
    senderRole: UserRole;
    content: string;
    timestamp: Date;
  }
  
  export interface DecodedToken {
    id: string;
    email: string;
    role: UserRole;
  }