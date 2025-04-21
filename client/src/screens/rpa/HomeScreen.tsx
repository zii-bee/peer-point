// src/screens/rpa/HomeScreen.tsx
import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';

const RPAHomeScreen = () => {
  const navigation = useNavigation();
  const { state } = useAuth();
  const { activeRPAs, activeAdmins } = useSocket();

  const navigateToChat = (chatId) => {
    navigation.navigate('Chat', { chatId });
  };

  const renderUserItem = (user: User, isAdmin = false) => {
    return (
      <View className="flex-row items-center bg-white p-4 mb-2 rounded-lg border border-gray-100">
        <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center mr-3">
          <Text className="text-lg text-primary-600 font-bold">
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-800 font-medium">{user.name}</Text>
          <Text className="text-gray-500 text-sm">{user.email}</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-green-500 mr-1" />
          <Text className="text-green-600 text-sm">Online</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="px-6 py-8">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-primary-800">RPA Dashboard</Text>
            <View className="flex-row items-center bg-green-100 px-3 py-1 rounded-full">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
              <Text className="text-green-700">Active</Text>
            </View>
          </View>

          <View className="bg-primary-50 p-6 rounded-xl mb-6">
            <Text className="text-xl font-bold text-primary-800 mb-2">Your Status</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-700">Current Role:</Text>
              <Text className="text-primary-700 font-bold">Restorative Practice Ambassador</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-700">Active Chats:</Text>
              <Text className="text-primary-700 font-bold">{state.user?.currentChats || 0}</Text>
            </View>
            <View className="mt-4">
              <Text className="text-xs text-gray-500">
                Students will be automatically connected to you when you're the least busy active RPA.
              </Text>
            </View>
          </View>

          {activeRPAs.length > 0 && (
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-800 mb-4">Active RPAs</Text>
              {activeRPAs.map(rpa => renderUserItem(rpa))}
            </View>
          )}

          {activeAdmins.length > 0 && (
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-800 mb-4">Active Admins</Text>
              {activeAdmins.map(admin => renderUserItem(admin, true))}
            </View>
          )}

          <View className="py-4">
            <Text className="text-center text-gray-500">
              Waiting for incoming student conversations...
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RPAHomeScreen;