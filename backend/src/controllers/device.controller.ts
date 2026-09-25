import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as deviceService from '../services/device.service';

export const getDevices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const devices = await deviceService.getDevicesByUser(req.userId);
    res.json({ devices });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const registerDevice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { deviceName, devicePublicKey, platform, appVersion } = req.body;
    
    if (!deviceName || !devicePublicKey || !platform || !appVersion) {
      res.status(400).json({ error: 'Missing required device registration fields' });
      return;
    }

    const device = await deviceService.registerDevice(
      req.userId,
      deviceName,
      devicePublicKey,
      platform,
      appVersion
    );
    
    res.status(201).json({ device });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteDevice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;
    await deviceService.deleteDevice(id, req.userId);
    res.json({ message: 'Device deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
