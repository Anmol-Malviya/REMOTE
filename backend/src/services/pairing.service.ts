import crypto from 'crypto';
import { PairingSession, IPairingSession } from '../models/PairingSession';

const EXPIRATION_MINUTES = 5;

// Hash token so we don't store it in plaintext in DB
const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const createPairingSession = async (remoteDeviceId: string): Promise<{ pairingId: string; token: string }> => {
  const pairingId = crypto.randomBytes(4).toString('hex'); // short id
  const token = crypto.randomBytes(16).toString('base64');
  
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + EXPIRATION_MINUTES);

  const session = new PairingSession({
    pairingId,
    tokenHash: hashToken(token),
    remoteDeviceId,
    status: 'WAITING',
    expiresAt,
  });

  await session.save();

  return { pairingId, token };
};

export const joinPairingSession = async (
  pairingId: string, 
  token: string, 
  controllerDeviceId: string
): Promise<IPairingSession> => {
  const session = await PairingSession.findOne({ pairingId, status: 'WAITING' });
  
  if (!session) {
    throw new Error('Invalid or expired pairing session');
  }

  if (session.tokenHash !== hashToken(token)) {
    throw new Error('Invalid token');
  }

  if (session.expiresAt < new Date()) {
    session.status = 'EXPIRED';
    await session.save();
    throw new Error('Pairing session expired');
  }

  session.controllerDeviceId = controllerDeviceId as any;
  await session.save();

  return session;
};

export const approvePairing = async (pairingId: string, remoteDeviceId: string): Promise<IPairingSession> => {
  const session = await PairingSession.findOne({ pairingId, remoteDeviceId });
  if (!session) {
    throw new Error('Session not found');
  }

  session.status = 'APPROVED';
  await session.save();
  return session;
};

export const rejectPairing = async (pairingId: string, remoteDeviceId: string): Promise<IPairingSession> => {
  const session = await PairingSession.findOne({ pairingId, remoteDeviceId });
  if (!session) {
    throw new Error('Session not found');
  }

  session.status = 'REJECTED';
  await session.save();
  return session;
};
