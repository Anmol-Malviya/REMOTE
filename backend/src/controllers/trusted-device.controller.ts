import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as trustedDeviceService from '../services/trusted-device.service';

// For this endpoint to work securely, the request might need to specify WHICH device they are operating from.
// Typically this comes from device-specific authentication, but for now we assume the client sends `deviceId` in headers or query.

export const getTrustedDevices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerDeviceId = req.query.deviceId as string;
    if (!ownerDeviceId) {
      res.status(400).json({ error: 'deviceId query parameter is required' });
      return;
    }

    const trustedDevices = await trustedDeviceService.getTrustedDevices(ownerDeviceId);
    res.json({ trustedDevices });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const revokeTrustedDevice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const ownerDeviceId = req.body.deviceId;
    
    if (!ownerDeviceId) {
      res.status(400).json({ error: 'deviceId is required in the body' });
      return;
    }

    await trustedDeviceService.revokeTrustedDevice(id, ownerDeviceId);
    res.json({ message: 'Trusted device revoked successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
