// server/src/config/email.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendVerificationEmail = async (
  email: string, 
  token: string
): Promise<void> => {
  const clientURL = process.env.CLIENT_URL || 'http://localhost:3000';
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'PeerPoint - Email Verification',
    html: `
      <h1>Verify Your Email Address</h1>
      <p>Thank you for registering with PeerPoint. Please verify your email address to complete the registration:</p>
      <a href="${clientURL}/verify-email/${token}" style="padding: 10px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>If you did not create an account, please ignore this email.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (
  email: string, 
  token: string
): Promise<void> => {
  const clientURL = process.env.CLIENT_URL || 'http://localhost:3000';
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'PeerPoint - Password Reset',
    html: `
      <h1>Reset Your Password</h1>
      <p>You requested a password reset. Please click the button below to reset your password:</p>
      <a href="${clientURL}/reset-password/${token}" style="padding: 10px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};