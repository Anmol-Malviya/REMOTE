import mongoose, { Document, Schema } from 'mongoose';

export interface IRemoteSession extends Document {
  sessionId: string;
  controllerDeviceId: mongoose.Types.ObjectId;
  remoteDeviceId: mongoose.Types.ObjectId;
  status: 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'ENDED' | 'EXPIRED' | 'ERROR';
  startedAt: Date;
  endedAt: Date | null;
  expiresAt: Date;
  terminationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const RemoteSessionSchema = new Schema<IRemoteSession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    controllerDeviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true, index: true },
    remoteDeviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true, index: true },
    status: { 
      type: String, 
      enum: ['CONNECTING', 'CONNECTED', 'RECONNECTING', 'ENDED', 'EXPIRED', 'ERROR'], 
      default: 'CONNECTING',
      index: true 
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true, index: true },
    terminationReason: { type: String, default: null },
  },
  { timestamps: true }
);

export const RemoteSession = mongoose.model<IRemoteSession>('RemoteSession', RemoteSessionSchema);
