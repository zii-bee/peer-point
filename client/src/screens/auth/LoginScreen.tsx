// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTouchableOpacity = styled(TouchableOpacity);

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required')
    .matches(/@nyu\.edu$/, 'Must be an NYU email'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      await login(values.email, values.password);
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Something went wrong'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-white">
      <StyledView className="flex-1 px-6 justify-center">
        <StyledView className="items-center mb-8">
          <Image
            source={require('../../../assets/logo.png')}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
          <StyledText className="text-primary-800 text-3xl font-bold mt-4">
            PeerPoint
          </StyledText>
          <StyledText className="text-gray-600 text-base mt-2 text-center">
            Connect with NYU Peer Advisors
          </StyledText>
        </StyledView>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ handleChange, handleSubmit, values, errors, touched }) => (
            <StyledView>
              <Input
                label="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                placeholder="your.name@nyu.edu"
                keyboardType="email-address"
                error={touched.email ? errors.email : undefined}
              />

              <Input
                label="Password"
                value={values.password}
                onChangeText={handleChange('password')}
                placeholder="********"
                secureTextEntry
                error={touched.password ? errors.password : undefined}
              />

              <StyledTouchableOpacity
                className="mb-6"
                onPress={() => navigation.navigate('ForgotPassword' as never)}
              >
                <StyledText className="text-primary-600 text-right">
                  Forgot Password?
                </StyledText>
              </StyledTouchableOpacity>

              <Button
                title={isLoading ? 'Logging in...' : 'Log In'}
                onPress={() => handleSubmit()}
                disabled={isLoading}
              />
            </StyledView>
          )}
        </Formik>

        <StyledView className="flex-row justify-center mt-8">
          <StyledText className="text-gray-600">Don't have an account? </StyledText>
          <StyledTouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
            <StyledText className="text-primary-600 font-bold">Sign Up</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </StyledSafeAreaView>
  );
};

export default LoginScreen;