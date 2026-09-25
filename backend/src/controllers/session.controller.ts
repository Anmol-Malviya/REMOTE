import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as sessionService from '../services/session.service';

export const createSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pairingId } = req.body;
    if (!pairingId) {
      res.status(400).json({ error: 'pairingId is required' });
      return;
    }

    const session = await sessionService.createRemoteSession(pairingId);
    res.status(201).json({ session });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const endSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { reason = 'USER_DISCONNECT' } = req.body;
    
    await sessionService.endRemoteSession(id, reason);
    res.json({ message: 'Session ended successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deviceId = req.query.deviceId as string;
    if (!deviceId) {
      res.status(400).json({ error: 'deviceId query parameter is required' });
      return;
    }

    const sessions = await sessionService.getSessionsByDevice(deviceId);
    res.json({ sessions });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
