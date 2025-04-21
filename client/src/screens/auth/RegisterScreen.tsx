// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
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
const StyledScrollView = styled(ScrollView);

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required')
    .matches(/@nyu\.edu$/, 'Must be an NYU email'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (values: { 
    name: string; 
    email: string; 
    password: string;
    confirmPassword: string;
  }) => {
    try {
      setIsLoading(true);
      await register(values.name, values.email, values.password);
      Alert.alert(
        'Registration Successful',
        'Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login' as never),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'Something went wrong'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-white">
      <StyledScrollView>
        <StyledView className="px-6 py-8">
          <StyledView className="items-center mb-8">
            <Image
              source={require('../../../assets/logo.png')}
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
            />
            <StyledText className="text-primary-800 text-3xl font-bold mt-2">
              Create Account
            </StyledText>
            <StyledText className="text-gray-600 text-base mt-1 text-center">
              Join the NYU PeerPoint Community
            </StyledText>
          </StyledView>

          <Formik
            initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
            validationSchema={RegisterSchema}
            onSubmit={handleRegister}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <StyledView>
                <Input
                  label="Full Name"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  placeholder="John Doe"
                  autoCapitalize="words"
                  error={touched.name ? errors.name : undefined}
                />

                <Input
                  label="NYU Email"
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

                <Input
                  label="Confirm Password"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  placeholder="********"
                  secureTextEntry
                  error={touched.confirmPassword ? errors.confirmPassword : undefined}
                />

                <Button
                  title={isLoading ? 'Creating Account...' : 'Sign Up'}
                  onPress={() => handleSubmit()}
                  disabled={isLoading}
                  className="mt-4"
                />
              </StyledView>
            )}
          </Formik>

          <StyledView className="flex-row justify-center mt-8">
            <StyledText className="text-gray-600">Already have an account? </StyledText>
            <StyledTouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <StyledText className="text-primary-600 font-bold">Log In</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

export default RegisterScreen;