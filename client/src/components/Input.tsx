// src/components/Input.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styled } from 'nativewind';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  className?: string;
}

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <StyledView className={`mb-4 ${className}`}>
      <StyledText className="text-gray-700 mb-1 font-medium">{label}</StyledText>
      <StyledView className="relative">
        <StyledTextInput
          className={`border ${error ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-2 rounded-lg text-gray-800`}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {secureTextEntry && (
          <StyledTouchableOpacity
            className="absolute right-3 top-2.5"
            onPress={() => setShowPassword(!showPassword)}
          >
            <Feather
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="gray"
            />
          </StyledTouchableOpacity>
        )}
      </StyledView>
      {error && <StyledText className="text-red-500 mt-1 text-sm">{error}</StyledText>}
    </StyledView>
  );
};

export default Input;