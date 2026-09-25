import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as pairingService from '../services/pairing.service';

export const createSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.body;
    if (!deviceId) {
      res.status(400).json({ error: 'deviceId is required' });
      return;
    }

    const result = await pairingService.createPairingSession(deviceId);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const joinSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pairingId, token, deviceId } = req.body;
    if (!pairingId || !token || !deviceId) {
      res.status(400).json({ error: 'pairingId, token, and deviceId are required' });
      return;
    }

    const session = await pairingService.joinPairingSession(pairingId, token, deviceId);
    res.json({ session });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const approveSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pairingId, deviceId } = req.body;
    if (!pairingId || !deviceId) {
      res.status(400).json({ error: 'pairingId and deviceId are required' });
      return;
    }

    const session = await pairingService.approvePairing(pairingId, deviceId);
    res.json({ session });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const rejectSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pairingId, deviceId } = req.body;
    if (!pairingId || !deviceId) {
      res.status(400).json({ error: 'pairingId and deviceId are required' });
      return;
    }

    const session = await pairingService.rejectPairing(pairingId, deviceId);
    res.json({ session });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
