// src/components/Button.tsx
import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  ...props
}) => {
  const buttonStyle = disabled 
    ? 'bg-gray-300 py-3 px-6 rounded-lg' 
    : variant === 'primary'
      ? 'bg-primary-600 py-3 px-6 rounded-lg'
      : variant === 'secondary'
        ? 'bg-primary-200 py-3 px-6 rounded-lg'
        : 'border border-primary-600 py-3 px-6 rounded-lg';
  
  const textStyle = disabled
    ? 'text-gray-500 font-bold text-center'
    : variant === 'primary'
      ? 'text-white font-bold text-center'
      : variant === 'secondary'
        ? 'text-primary-800 font-bold text-center'
        : 'text-primary-600 font-bold text-center';

  return (
    <TouchableOpacity 
      className={buttonStyle}
      onPress={onPress} 
      disabled={disabled}
      {...props}
    >
      <Text className={textStyle}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;