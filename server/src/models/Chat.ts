// server/src/models/Chat.ts
import mongoose, { Document, Schema } from 'mongoose';
import { IChat, UserRole } from '../types';

export interface ChatDocument extends Omit<IChat, '_id'>, Document {}

const chatSchema = new Schema<ChatDocument>(
  {
    participants: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      role: { 
        type: String, 
        enum: Object.values(UserRole),
        required: true 
      },
      isAnonymous: { type: Boolean, default: false }
    }],
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model<ChatDocument>('Chat', chatSchema);