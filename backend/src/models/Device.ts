import mongoose, { Document, Schema } from 'mongoose';

export interface IDevice extends Document {
  userId: mongoose.Types.ObjectId;
  deviceName: string;
  devicePublicKey: string;
  platform: string;
  appVersion: string;
  lastSeenAt: Date;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceSchema = new Schema<IDevice>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deviceName: { type: String, required: true },
    devicePublicKey: { type: String, required: true, index: true },
    platform: { type: String, required: true },
    appVersion: { type: String, required: true },
    lastSeenAt: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Device = mongoose.model<IDevice>('Device', DeviceSchema);
