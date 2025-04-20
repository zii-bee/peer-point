// server/src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';
import { IUser, UserRole } from '../types';
import bcrypt from 'bcrypt';

export interface UserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      validate: {
        validator: function(v: string) {
          return v.endsWith('@nyu.edu');
        },
        message: 'Email must be an NYU email address (@nyu.edu)'
      }
    },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: Object.values(UserRole),
      default: UserRole.USER 
    },
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isOnline: { type: Boolean, default: false },
    currentChats: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<UserDocument>('User', userSchema);