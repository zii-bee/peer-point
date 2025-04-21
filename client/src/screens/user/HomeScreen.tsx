// src/screens/user/HomeScreen.tsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button';
import { chatAPI } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';

const UserHomeScreen = () => {
  const navigation = useNavigation();
  const { activeRPAs } = useSocket();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const startChat = async () => {
    if (activeRPAs.length === 0) {
      Alert.alert('No RPAs Available', 'Please try again later when RPAs are online.');
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await chatAPI.createChat(undefined, isAnonymous);
      navigation.navigate('Chat', { chatId: data.chat.id });
    } catch (error) {
      Alert.alert('Error', 'Failed to start chat. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-6 py-8">
          <Text className="text-3xl font-bold text-primary-800 mb-2">Welcome to PeerPoint</Text>
          <Text className="text-gray-600 mb-8">
            Connect with NYU Restorative Practice Ambassadors for guidance on roommate issues, 
            sensitive discussions, campus resources, and more.
          </Text>

          <View className="bg-primary-50 p-6 rounded-xl mb-8">
            <Text className="text-xl font-bold text-primary-800 mb-2">How It Works</Text>
            <Text className="text-gray-700 mb-4">
              PeerPoint connects you with trained peer advisors who can help with:
            </Text>
            <View className="mb-2">
              <Text className="text-gray-700">• Roommate conflicts</Text>
              <Text className="text-gray-700">• Academic concerns</Text>
              <Text className="text-gray-700">• Campus resources</Text>
              <Text className="text-gray-700">• General guidance</Text>
            </View>
          </View>

          <View className="bg-white border border-gray-200 p-6 rounded-xl mb-8">
            <Text className="text-xl font-bold text-gray-800 mb-2">Important Disclaimer</Text>
            <Text className="text-gray-700 mb-4">
              Conversations are not stored permanently. If you close the app or browser tab,
              your conversation will end. You can view past chat logs in your history.
            </Text>
            
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-700 font-medium">Chat Anonymously</Text>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: '#d1d5db', true: '#8b5cf6' }}
                thumbColor="#ffffff"
              />
            </View>
            <Text className="text-gray-500 text-sm mb-4">
              {isAnonymous 
                ? 'Your name and email will be hidden from the RPA.'
                : 'Your name and email will be visible to the RPA.'}
            </Text>
          </View>

          <Text className="text-center text-green-600 font-medium mb-4">
            {activeRPAs.length > 0 
              ? `${activeRPAs.length} RPAs currently available`
              : 'No RPAs currently available'}
          </Text>

          <Button
            title={isLoading ? "Connecting..." : "Start a Conversation"}
            onPress={startChat}
            disabled={isLoading || activeRPAs.length === 0}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserHomeScreen;