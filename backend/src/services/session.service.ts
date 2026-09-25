import crypto from 'crypto';
import { RemoteSession, IRemoteSession } from '../models/RemoteSession';
import { PairingSession } from '../models/PairingSession';

const SESSION_TIMEOUT_MINUTES = 30;

export const createRemoteSession = async (pairingId: string): Promise<IRemoteSession> => {
  const pairingSession = await PairingSession.findOne({ pairingId, status: 'APPROVED' });
  if (!pairingSession) {
    throw new Error('Valid approved pairing session required');
  }

  const sessionId = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + SESSION_TIMEOUT_MINUTES);

  const session = new RemoteSession({
    sessionId,
    controllerDeviceId: pairingSession.controllerDeviceId,
    remoteDeviceId: pairingSession.remoteDeviceId,
    status: 'CONNECTING',
    expiresAt,
  });

  await session.save();

  // Invalidate the pairing session so it can't be reused
  pairingSession.status = 'EXPIRED';
  await pairingSession.save();

  return session;
};

export const endRemoteSession = async (sessionId: string, reason: string): Promise<void> => {
  const session = await RemoteSession.findOne({ sessionId });
  if (!session) {
    throw new Error('Session not found');
  }

  session.status = 'ENDED';
  session.endedAt = new Date();
  session.terminationReason = reason;

  await session.save();
};

export const getSessionsByDevice = async (deviceId: string): Promise<IRemoteSession[]> => {
  return RemoteSession.find({
    $or: [{ controllerDeviceId: deviceId }, { remoteDeviceId: deviceId }]
  }).sort({ createdAt: -1 });
};
