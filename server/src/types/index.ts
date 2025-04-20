// server/src/types/index.ts
export enum UserRole {
    USER = 'user',
    RPA = 'rpa',
    ADMIN = 'admin'
  }
  
  export interface IUser {
    _id: string;
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
    _id: string;
    participants: Array<{
      userId: string;
      role: UserRole;
      isAnonymous: boolean;
    }>;
    messages: string[];
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
  }
  
  export interface IMessage {
    _id: string;
    chatId: string;
    sender: string;
    senderRole: UserRole;
    content: string;
    timestamp: Date;
  }
  
  export interface DecodedToken {
    id: string;
    email: string;
    role: UserRole;
  }