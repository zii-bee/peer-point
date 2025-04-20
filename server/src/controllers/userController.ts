// server/src/controllers/userController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import { UserRole } from '../types';

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find()
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires')
      .sort({ name: 1 });
    
    res.status(200).json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all RPAs
export const getAllRPAs = async (req: Request, res: Response): Promise<void> => {
  try {
    const rpas = await User.find({ role: UserRole.RPA })
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires')
      .sort({ name: 1 });
    
    res.status(200).json({ rpas });
  } catch (error) {
    console.error('Get all RPAs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get active RPAs
export const getActiveRPAs = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeRPAs = await User.find({ 
      role: UserRole.RPA,
      isOnline: true 
    })
    .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires')
    .sort({ currentChats: 1 });
    
    res.status(200).json({ activeRPAs });
  } catch (error) {
    console.error('Get active RPAs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get active admins
export const getActiveAdmins = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeAdmins = await User.find({ 
      role: UserRole.ADMIN,
      isOnline: true 
    })
    .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
    
    res.status(200).json({ activeAdmins });
  } catch (error) {
    console.error('Get active admins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role as UserRole)) {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.role = role as UserRole;
    await user.save();

    res.status(200).json({ 
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};