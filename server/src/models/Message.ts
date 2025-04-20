// server/src/models/Message.ts
import mongoose, { Document, Schema } from 'mongoose';
import { IMessage, UserRole } from '../types';

export interface MessageDocument extends Omit<IMessage, '_id'>, Document {}

const messageSchema = new Schema<MessageDocument>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { 
      type: String, 
      enum: Object.values(UserRole),
      required: true 
    },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }
);

export default mongoose.model<MessageDocument>('Message', messageSchema);