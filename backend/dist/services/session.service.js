"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionsByDevice = exports.endRemoteSession = exports.createRemoteSession = void 0;
const crypto_1 = __importDefault(require("crypto"));
const RemoteSession_1 = require("../models/RemoteSession");
const PairingSession_1 = require("../models/PairingSession");
const SESSION_TIMEOUT_MINUTES = 30;
const createRemoteSession = async (pairingId) => {
    const pairingSession = await PairingSession_1.PairingSession.findOne({ pairingId, status: 'APPROVED' });
    if (!pairingSession) {
        throw new Error('Valid approved pairing session required');
    }
    const sessionId = crypto_1.default.randomBytes(16).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + SESSION_TIMEOUT_MINUTES);
    const session = new RemoteSession_1.RemoteSession({
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
exports.createRemoteSession = createRemoteSession;
const endRemoteSession = async (sessionId, reason) => {
    const session = await RemoteSession_1.RemoteSession.findOne({ sessionId });
    if (!session) {
        throw new Error('Session not found');
    }
    session.status = 'ENDED';
    session.endedAt = new Date();
    session.terminationReason = reason;
    await session.save();
};
exports.endRemoteSession = endRemoteSession;
const getSessionsByDevice = async (deviceId) => {
    return RemoteSession_1.RemoteSession.find({
        $or: [{ controllerDeviceId: deviceId }, { remoteDeviceId: deviceId }]
    }).sort({ createdAt: -1 });
};
exports.getSessionsByDevice = getSessionsByDevice;
