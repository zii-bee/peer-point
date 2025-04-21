// src/screens/user/ProfileScreen.tsx
import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const ProfileScreen = () => {
  const { state, logout } = useAuth();
  const user = state.user;

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => logout() }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-8">
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-primary-100 items-center justify-center mb-4">
            <Text className="text-4xl text-primary-600 font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-gray-800">{user?.name}</Text>
          <Text className="text-gray-600">{user?.email}</Text>
          <View className="bg-primary-100 px-3 py-1 rounded-full mt-2">
            <Text className="text-primary-800">Student</Text>
          </View>
        </View>

        <View className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons name="person-outline" size={24} color="#6b7280" className="mr-4" />
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Account Settings</Text>
              <Text className="text-gray-500 text-sm">Update your personal information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons name="notifications-outline" size={24} color="#6b7280" className="mr-4" />
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Notifications</Text>
              <Text className="text-gray-500 text-sm">Manage notification preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <Ionicons name="shield-outline" size={24} color="#6b7280" className="mr-4" />
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Privacy</Text>
              <Text className="text-gray-500 text-sm">Control your privacy settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4">
            <Ionicons name="help-circle-outline" size={24} color="#6b7280" className="mr-4" />
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Help & Support</Text>
              <Text className="text-gray-500 text-sm">Get assistance with PeerPoint</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className="mt-8 p-4 bg-red-50 rounded-lg flex-row items-center justify-center"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text className="text-red-600 font-medium ml-2">Logout</Text>
        </TouchableOpacity>

        <Text className="text-gray-400 text-xs text-center mt-8">
          PeerPoint v1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;