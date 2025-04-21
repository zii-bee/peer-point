// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NativeWindStyleSheet } from "nativewind";
import AppNavigator from './src/navigation';
import { AuthProvider } from './src/contexts/AuthContext';
import { SocketProvider } from './src/contexts/SocketContext';

// Ensure NativeWind works with React Native
NativeWindStyleSheet.setOutput({
  default: "native",
});

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </SocketProvider>
    </AuthProvider>
  );
}