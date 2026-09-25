"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectPairing = exports.approvePairing = exports.joinPairingSession = exports.createPairingSession = void 0;
const crypto_1 = __importDefault(require("crypto"));
const PairingSession_1 = require("../models/PairingSession");
const EXPIRATION_MINUTES = 5;
// Hash token so we don't store it in plaintext in DB
const hashToken = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
const createPairingSession = async (remoteDeviceId) => {
    const pairingId = crypto_1.default.randomBytes(4).toString('hex'); // short id
    const token = crypto_1.default.randomBytes(16).toString('base64');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + EXPIRATION_MINUTES);
    const session = new PairingSession_1.PairingSession({
        pairingId,
        tokenHash: hashToken(token),
        remoteDeviceId,
        status: 'WAITING',
        expiresAt,
    });
    await session.save();
    return { pairingId, token };
};
exports.createPairingSession = createPairingSession;
const joinPairingSession = async (pairingId, token, controllerDeviceId) => {
    const session = await PairingSession_1.PairingSession.findOne({ pairingId, status: 'WAITING' });
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
    session.controllerDeviceId = controllerDeviceId;
    await session.save();
    return session;
};
exports.joinPairingSession = joinPairingSession;
const approvePairing = async (pairingId, remoteDeviceId) => {
    const session = await PairingSession_1.PairingSession.findOne({ pairingId, remoteDeviceId });
    if (!session) {
        throw new Error('Session not found');
    }
    session.status = 'APPROVED';
    await session.save();
    return session;
};
exports.approvePairing = approvePairing;
const rejectPairing = async (pairingId, remoteDeviceId) => {
    const session = await PairingSession_1.PairingSession.findOne({ pairingId, remoteDeviceId });
    if (!session) {
        throw new Error('Session not found');
    }
    session.status = 'REJECTED';
    await session.save();
    return session;
};
exports.rejectPairing = rejectPairing;
