// src/types/index.ts
export enum UserRole {
    USER = 'user',
    RPA = 'rpa',
    ADMIN = 'admin'
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  }
  
  export interface Chat {
    id: string;
    participants: Array<{
      userId: string;
      role: UserRole;
      isAnonymous: boolean;
    }>;
    isActive: boolean;
    createdAt: string;
    messages: Message[];
  }
  
  export interface Message {
    id: string;
    chatId: string;
    sender: string;
    senderRole: UserRole;
    content: string;
    timestamp: string;
  }
  
  export interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }