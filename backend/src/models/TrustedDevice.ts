import mongoose, { Document, Schema } from 'mongoose';

export interface ITrustedDevice extends Document {
  ownerDeviceId: mongoose.Types.ObjectId;
  remoteDeviceId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  revokedAt: Date | null;
}

const TrustedDeviceSchema = new Schema<ITrustedDevice>(
  {
    ownerDeviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true, index: true },
    remoteDeviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true, index: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const TrustedDevice = mongoose.model<ITrustedDevice>('TrustedDevice', TrustedDeviceSchema);
