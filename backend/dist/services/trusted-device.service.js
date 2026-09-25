"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeTrustedDevice = exports.createTrustedDevice = exports.getTrustedDevices = void 0;
const TrustedDevice_1 = require("../models/TrustedDevice");
const getTrustedDevices = async (ownerDeviceId) => {
    return TrustedDevice_1.TrustedDevice.find({ ownerDeviceId, revokedAt: null }).populate('remoteDeviceId');
};
exports.getTrustedDevices = getTrustedDevices;
const createTrustedDevice = async (ownerDeviceId, remoteDeviceId) => {
    // Check if they already exist
    const existing = await TrustedDevice_1.TrustedDevice.findOne({
        ownerDeviceId,
        remoteDeviceId,
        revokedAt: null,
    });
    if (existing) {
        return existing;
    }
    const trustedDevice = new TrustedDevice_1.TrustedDevice({
        ownerDeviceId,
        remoteDeviceId,
    });
    await trustedDevice.save();
    return trustedDevice;
};
exports.createTrustedDevice = createTrustedDevice;
const revokeTrustedDevice = async (trustedDeviceId, ownerDeviceId) => {
    const result = await TrustedDevice_1.TrustedDevice.updateOne({ _id: trustedDeviceId, ownerDeviceId }, { $set: { revokedAt: new Date() } });
    if (result.matchedCount === 0) {
        throw new Error('Trusted device record not found or not owned by user');
    }
};
exports.revokeTrustedDevice = revokeTrustedDevice;
