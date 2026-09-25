import { Device, IDevice } from '../models/Device';

export const registerDevice = async (
  userId: string,
  deviceName: string,
  devicePublicKey: string,
  platform: string,
  appVersion: string
): Promise<IDevice> => {
  const device = new Device({
    userId,
    deviceName,
    devicePublicKey,
    platform,
    appVersion,
    lastSeenAt: new Date(),
    isOnline: true,
  });

  await device.save();
  return device;
};

export const getDevicesByUser = async (userId: string): Promise<IDevice[]> => {
  return Device.find({ userId });
};

export const deleteDevice = async (deviceId: string, userId: string): Promise<void> => {
  const result = await Device.deleteOne({ _id: deviceId, userId });
  if (result.deletedCount === 0) {
    throw new Error('Device not found or not owned by user');
  }
};
