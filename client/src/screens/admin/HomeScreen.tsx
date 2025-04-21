// src/screens/admin/HomeScreen.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../../contexts/SocketContext';

const AdminHomeScreen = () => {
  const navigation = useNavigation();
  const { activeRPAs, activeAdmins } = useSocket();

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView>
        <View className="px-6 py-8">
          <Text className="text-3xl font-bold text-primary-800 mb-4">Admin Dashboard</Text>

          <View className="flex-row mb-6">
            <TouchableOpacity 
              className="flex-1 bg-primary-100 p-4 rounded-xl mr-2 items-center"
              onPress={() => navigation.navigate('Users')}
            >
              <Ionicons name="people" size={28} color="#6d28d9" />
              <Text className="text-primary-800 font-medium mt-2">Manage Users</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-1 bg-blue-100 p-4 rounded-xl ml-2 items-center"
              onPress={() => navigation.navigate('RPAs')}
            >
              <Ionicons name="people-circle" size={28} color="#1d4ed8" />
              <Text className="text-blue-800 font-medium mt-2">Manage RPAs</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">System Status</Text>
            
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Ionicons name="people-circle-outline" size={20} color="#6d28d9" className="mr-2" />
                <Text className="text-gray-700">Active RPAs:</Text>
              </View>
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-800 font-medium">{activeRPAs.length}</Text>
              </View>
            </View>
            
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Ionicons name="person-outline" size={20} color="#6d28d9" className="mr-2" />
                <Text className="text-gray-700">Active Admins:</Text>
              </View>
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-800 font-medium">{activeAdmins.length}</Text>
              </View>
            </View>
          </View>

          {activeRPAs.length > 0 && (
            <View className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <Text className="text-xl font-bold text-gray-800 mb-4">Active RPAs</Text>
              
              {activeRPAs.map(rpa => (
                <View key={rpa.id} className="flex-row items-center mb-4">
                  <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center mr-3">
                    <Text className="text-lg text-primary-600 font-bold">
                      {rpa.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 font-medium">{rpa.name}</Text>
                    <Text className="text-gray-500 text-sm">{rpa.email}</Text>
                  </View>
                  <View className="bg-primary-100 px-3 py-1 rounded-full">
                    <Text className="text-primary-800">{rpa.currentChats || 0} chats</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity 
            className="bg-primary-600 p-4 rounded-lg flex-row justify-center items-center"
            onPress={() => navigation.navigate('RPAs')}
          >
            <Text className="text-white font-bold">Manage All RPAs</Text>
            <Ionicons name="chevron-forward" size={18} color="white" className="ml-1" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminHomeScreen;