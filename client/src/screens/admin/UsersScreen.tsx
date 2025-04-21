// src/screens/admin/UsersScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userAPI } from '../../services/api';
import { UserRole } from '../../types';

const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await userAPI.getAllUsers();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const promoteToRPA = async (userId) => {
    try {
      await userAPI.updateUserRole(userId, UserRole.RPA);
      fetchUsers(); // Refresh the list
      Alert.alert('Success', 'User promoted to RPA successfully.');
    } catch (error) {
      console.error('Error promoting user:', error);
      Alert.alert('Error', 'Failed to promote user.');
    }
  };

  const handleRoleChange = (user) => {
    if (user.role === UserRole.USER) {
      Alert.alert(
        'Promote to RPA',
        `Are you sure you want to promote ${user.name} to RPA?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Promote', onPress: () => promoteToRPA(user.id) }
        ]
      );
    }
  };

  const renderUserItem = ({ item }) => {
    return (
      <TouchableOpacity 
        className="bg-white p-4 mb-2 rounded-lg border border-gray-100"
        onPress={() => handleRoleChange(item)}
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center mr-3">
            <Text className="text-lg text-primary-600 font-bold">
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-gray-800 font-medium">{item.name}</Text>
              <View className={`px-2 py-0.5 rounded-full ml-2 ${
                item.role === UserRole.ADMIN 
                  ? 'bg-purple-100' 
                  : item.role === UserRole.RPA 
                    ? 'bg-blue-100' 
                    : 'bg-green-100'
              }`}>
                <Text className={`text-xs font-medium ${
                  item.role === UserRole.ADMIN 
                    ? 'text-purple-800' 
                    : item.role === UserRole.RPA 
                      ? 'text-blue-800' 
                      : 'text-green-800'
                }`}>
                  {item.role === UserRole.ADMIN ? 'Admin' : item.role === UserRole.RPA ? 'RPA' : 'User'}
                </Text>
              </View>
            </View>
            <Text className="text-gray-500 text-sm">{item.email}</Text>
          </View>
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full ${item.isOnline ? 'bg-green-500' : 'bg-gray-300'} mr-1`} />
            <Text className={`text-sm ${item.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
              {item.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        
        {item.role === UserRole.USER && (
          <View className="mt-2 ml-13">
            <TouchableOpacity 
              className="bg-blue-50 flex-row items-center self-start px-3 py-1 rounded-full"
              onPress={() => promoteToRPA(item.id)}
            >
              <Ionicons name="arrow-up-circle-outline" size={16} color="#1d4ed8" />
              <Text className="text-blue-700 text-sm ml-1">Promote to RPA</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-gray-600 mt-4">Loading users...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-primary-800 mb-4">Manage Users</Text>
      
      <FlatList
        data={users.filter(user => user.role !== UserRole.ADMIN)} // Exclude admins from this list
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={fetchUsers}
        ListEmptyComponent={
          <View className="py-8 items-center">
            <Text className="text-gray-500 text-center">No users found.</Text>
          </View>
        }
      />
    </View>
  );
};

export default UsersScreen;