"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDevice = exports.getDevicesByUser = exports.registerDevice = void 0;
const Device_1 = require("../models/Device");
const registerDevice = async (userId, deviceName, devicePublicKey, platform, appVersion) => {
    const device = new Device_1.Device({
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
exports.registerDevice = registerDevice;
const getDevicesByUser = async (userId) => {
    return Device_1.Device.find({ userId });
};
exports.getDevicesByUser = getDevicesByUser;
const deleteDevice = async (deviceId, userId) => {
    const result = await Device_1.Device.deleteOne({ _id: deviceId, userId });
    if (result.deletedCount === 0) {
        throw new Error('Device not found or not owned by user');
    }
};
exports.deleteDevice = deleteDevice;
