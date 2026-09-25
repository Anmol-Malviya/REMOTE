import { TrustedDevice, ITrustedDevice } from '../models/TrustedDevice';
import { Device } from '../models/Device';
import mongoose from 'mongoose';

export const getTrustedDevices = async (ownerDeviceId: string): Promise<ITrustedDevice[]> => {
  return TrustedDevice.find({ ownerDeviceId, revokedAt: null }).populate('remoteDeviceId');
};

export const createTrustedDevice = async (
  ownerDeviceId: string,
  remoteDeviceId: string
): Promise<ITrustedDevice> => {
  // Check if they already exist
  const existing = await TrustedDevice.findOne({
    ownerDeviceId,
    remoteDeviceId,
    revokedAt: null,
  });

  if (existing) {
    return existing;
  }

  const trustedDevice = new TrustedDevice({
    ownerDeviceId,
    remoteDeviceId,
  });

  await trustedDevice.save();
  return trustedDevice;
};

export const revokeTrustedDevice = async (trustedDeviceId: string, ownerDeviceId: string): Promise<void> => {
  const result = await TrustedDevice.updateOne(
    { _id: trustedDeviceId, ownerDeviceId },
    { $set: { revokedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    throw new Error('Trusted device record not found or not owned by user');
  }
};
