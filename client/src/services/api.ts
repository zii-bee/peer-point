// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:5000/api'; // For Android emulator

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  register: (name: string, email: string, password: string) => 
    api.post('/auth/register', { name, email, password }),
  
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  logout: () => api.post('/auth/logout'),
  
  verifyEmail: (token: string) => 
    api.get(`/auth/verify-email/${token}`),
  
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) => 
    api.post(`/auth/reset-password/${token}`, { password }),
  
  getProfile: () => api.get('/auth/profile'),
};

// User API
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  
  getAllRPAs: () => api.get('/users/rpas'),
  
  getActiveRPAs: () => api.get('/users/rpas/active'),
  
  getActiveAdmins: () => api.get('/users/admins/active'),
  
  updateUserRole: (userId: string, role: string) => 
    api.patch(`/users/${userId}/role`, { role }),
};

// Chat API
export const chatAPI = {
  createChat: (targetUserId?: string, isAnonymous?: boolean) => 
    api.post('/chats', { targetUserId, isAnonymous }),
  
  endChat: (chatId: string) => 
    api.patch(`/chats/${chatId}/end`),
  
  getUserChatHistory: (page = 1, limit = 10) => 
    api.get(`/chats/history?page=${page}&limit=${limit}`),
  
  getRPAChatHistory: (rpaId: string, page = 1, limit = 10) => 
    api.get(`/chats/history/rpa/${rpaId}?page=${page}&limit=${limit}`),
  
  getChatDetails: (chatId: string) => 
    api.get(`/chats/${chatId}`),
  
  sendMessage: (chatId: string, content: string) => 
    api.post(`/chats/${chatId}/messages`, { content }),
};

export default api;