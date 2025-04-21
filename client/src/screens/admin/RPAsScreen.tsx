// src/screens/admin/RPAsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { userAPI, chatAPI } from '../../services/api';
import { UserRole } from '../../types';

const RPAsScreen = () => {
  const [rpas, setRPAs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchRPAs();
  }, []);

  const fetchRPAs = async () => {
    try {
      setLoading(true);
      const { data } = await userAPI.getAllRPAs();
      setRPAs(data.rpas);
    } catch (error) {
      console.error('Error fetching RPAs:', error);
      Alert.alert('Error', 'Failed to load RPAs.');
    } finally {
      setLoading(false);
    }
  };

  const demoteToUser = async (userId) => {
    try {
      await userAPI.updateUserRole(userId, UserRole.USER);
      fetchRPAs(); // Refresh the list
      Alert.alert('Success', 'RPA demoted to regular user successfully.');
    } catch (error) {
      console.error('Error demoting RPA:', error);
      Alert.alert('Error', 'Failed to demote RPA.');
    }
  };

  const initiateChat = async (rpaId) => {
    try {
      const { data } = await chatAPI.createChat(rpaId, false);
      navigation.navigate('Chat', { chatId: data.chat.id });
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('Error', 'Failed to start conversation with RPA.');
    }
  };

  const viewChatHistory = (rpaId, name) => {
    navigation.navigate('RPAChatHistory', { rpaId, name });
  };

  const renderRPAItem = ({ item }) => {
    return (
      <View className="bg-white p-4 mb-2 rounded-lg border border-gray-100">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center mr-3">
            <Text className="text-lg text-primary-600 font-bold">
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-800 font-medium">{item.name}</Text>
            <Text className="text-gray-500 text-sm">{item.email}</Text>
          </View>
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full ${item.isOnline ? 'bg-green-500' : 'bg-gray-300'} mr-1`} />
            <Text className={`text-sm ${item.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
              {item.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        
        <View className="flex-row mt-4 justify-between">
          <TouchableOpacity 
            className="flex-1 mr-2 bg-primary-50 py-2 rounded-lg items-center"
            onPress={() => initiateChat(item.id)}
          >
            <Text className="text-primary-700">Start Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 mr-2 bg-blue-50 py-2 rounded-lg items-center"
            onPress={() => viewChatHistory(item.id, item.name)}
          >
            <Text className="text-blue-700">View History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 bg-red-50 py-2 rounded-lg items-center"
            onPress={() => {
              Alert.alert(
                'Demote RPA',
                `Are you sure you want to demote ${item.name} to regular user?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Demote', onPress: () => demoteToUser(item.id) }
                ]
              );
            }}
          >
            <Text className="text-red-700">Demote</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-gray-600 mt-4">Loading RPAs...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-primary-800 mb-4">Manage RPAs</Text>
      
      <FlatList
        data={rpas}
        renderItem={renderRPAItem}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={fetchRPAs}
        ListEmptyComponent={
          <View className="py-8 items-center">
            <Text className="text-gray-500 text-center">No RPAs found.</Text>
          </View>
        }
      />
    </View>
  );
};

export default RPAsScreen;