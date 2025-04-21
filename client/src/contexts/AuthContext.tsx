// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User, UserRole } from '../types';
import { authAPI } from '../services/api';

// Initial state
const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

// Auth actions
type AuthAction = 
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: User } }
  | { type: 'LOGOUT' }
  | { type: 'AUTH_ERROR' }
  | { type: 'LOADED' };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
    case 'AUTH_ERROR':
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOADED':
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Auth context props
type AuthContextProps = {
  state: AuthState;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
};

// Create auth context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load token on app start
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const { data } = await authAPI.getProfile();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { token, user: data.user },
          });
        } else {
          dispatch({ type: 'LOADED' });
        }
      } catch (error) {
        await AsyncStorage.removeItem('token');
        dispatch({ type: 'AUTH_ERROR' });
      }
    };

    loadToken();
  }, []);

  // Register user
  const register = async (name: string, email: string, password: string) => {
    try {
      await authAPI.register(name, email, password);
    } catch (error) {
      throw error;
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      const { data } = await authAPI.login(email, password);
      await AsyncStorage.setItem('token', data.token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token: data.token, user: data.user },
      });
    } catch (error) {
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Forgot password
  const forgotPassword = async (email: string) => {
    try {
      await authAPI.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ state, register, login, logout, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};