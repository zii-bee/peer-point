// src/screens/LoadingScreen.tsx
import React from 'react';
import { View, ActivityIndicator, Text, Image } from 'react-native';

const LoadingScreen = () => {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: 120, height: 120, marginBottom: 20 }}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#8b5cf6" />
      <Text className="text-primary-600 font-medium mt-4">Loading PeerPoint...</Text>
    </View>
  );
};

export default LoadingScreen;