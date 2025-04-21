// src/navigation/index.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

// User Screens
import UserHomeScreen from '../screens/user/HomeScreen';
import UserChatScreen from '../screens/user/ChatScreen';
import UserHistoryScreen from '../screens/user/HistoryScreen';
import UserProfileScreen from '../screens/user/ProfileScreen.';

// RPA Screens
import RPAHomeScreen from '../screens/rpa/HomeScreen';
import RPAChatScreen from '../screens/rpa/ChatScreen';
import RPAHistoryScreen from '../screens/rpa/HistoryScreen';
import RPAProfileScreen from '../screens/rpa/ProfileScreen';

// Admin Screens
import AdminHomeScreen from '../screens/admin/HomeScreen';
import AdminUsersScreen from '../screens/admin/UsersScreen';
import AdminRPAsScreen from '../screens/admin/RPAsScreen';
import AdminChatScreen from '../screens/admin/ChatScreen';
import AdminHistoryScreen from '../screens/admin/HistoryScreen';
import AdminProfileScreen from '../screens/admin/ProfileScreen';

// Loading Screen
import LoadingScreen from '../screens/LoadingScreen';

// Stack and Tab Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator (Login, Register, etc.)
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </Stack.Navigator>
);

// User Tab Navigator
const UserTabNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={UserHomeScreen} />
    <Tab.Screen name="History" component={UserHistoryScreen} />
    <Tab.Screen name="Profile" component={UserProfileScreen} />
  </Tab.Navigator>
);

// RPA Tab Navigator
const RPATabNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={RPAHomeScreen} />
    <Tab.Screen name="History" component={RPAHistoryScreen} />
    <Tab.Screen name="Profile" component={RPAProfileScreen} />
  </Tab.Navigator>
);

// Admin Tab Navigator
const AdminTabNavigator = () => (
    <Stack.Screen 
    name="RPAChatHistory" 
    component={RPAChatHistoryScreen} 
    options={({ route }) => ({ 
      title: `${route.params.name}'s Chat History` 
    })} 
  />
);

// User Stack Navigator (including Chat)
const UserStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="UserTabs" component={UserTabNavigator} options={{ headerShown: false }} />
    <Stack.Screen name="Chat" component={UserChatScreen} />
  </Stack.Navigator>
);

// RPA Stack Navigator (including Chat)
const RPAStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="RPATabs" component={RPATabNavigator} options={{ headerShown: false }} />
    <Stack.Screen name="Chat" component={RPAChatScreen} />
  </Stack.Navigator>
);

// Admin Stack Navigator (including Chat)
const AdminStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="AdminTabs" component={AdminTabNavigator} options={{ headerShown: false }} />
    <Stack.Screen name="Chat" component={AdminChatScreen} />
  </Stack.Navigator>
);

// Main Navigator
const MainNavigator = () => {
  const { state } = useAuth();

  if (state.isLoading) {
    return <LoadingScreen />;
  }

  if (!state.isAuthenticated) {
    return <AuthNavigator />;
  }

  switch (state.user?.role) {
    case UserRole.USER:
      return <UserStackNavigator />;
    case UserRole.RPA:
      return <RPAStackNavigator />;
    case UserRole.ADMIN:
      return <AdminStackNavigator />;
    default:
      return <AuthNavigator />;
  }
};

// App Navigator
const AppNavigator = () => (
  <NavigationContainer>
    <MainNavigator />
  </NavigationContainer>
);

export default AppNavigator;