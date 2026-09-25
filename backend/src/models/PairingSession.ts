import mongoose, { Document, Schema } from 'mongoose';

export interface IPairingSession extends Document {
  pairingId: string;
  tokenHash: string;
  controllerDeviceId: mongoose.Types.ObjectId;
  remoteDeviceId: mongoose.Types.ObjectId;
  status: 'WAITING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PairingSessionSchema = new Schema<IPairingSession>(
  {
    pairingId: { type: String, required: true, unique: true, index: true },
    tokenHash: { type: String, required: true },
    controllerDeviceId: { type: Schema.Types.ObjectId, ref: 'Device', index: true },
    remoteDeviceId: { type: Schema.Types.ObjectId, ref: 'Device', index: true },
    status: { type: String, enum: ['WAITING', 'APPROVED', 'REJECTED', 'EXPIRED'], default: 'WAITING' },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

export const PairingSession = mongoose.model<IPairingSession>('PairingSession', PairingSessionSchema);
