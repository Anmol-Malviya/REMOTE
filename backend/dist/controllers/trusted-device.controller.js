"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeTrustedDevice = exports.getTrustedDevices = void 0;
const trustedDeviceService = __importStar(require("../services/trusted-device.service"));
// For this endpoint to work securely, the request might need to specify WHICH device they are operating from.
// Typically this comes from device-specific authentication, but for now we assume the client sends `deviceId` in headers or query.
const getTrustedDevices = async (req, res) => {
    try {
        const ownerDeviceId = req.query.deviceId;
        if (!ownerDeviceId) {
            res.status(400).json({ error: 'deviceId query parameter is required' });
            return;
        }
        const trustedDevices = await trustedDeviceService.getTrustedDevices(ownerDeviceId);
        res.json({ trustedDevices });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getTrustedDevices = getTrustedDevices;
const revokeTrustedDevice = async (req, res) => {
    try {
        const id = req.params.id;
        const ownerDeviceId = req.body.deviceId;
        if (!ownerDeviceId) {
            res.status(400).json({ error: 'deviceId is required in the body' });
            return;
        }
        await trustedDeviceService.revokeTrustedDevice(id, ownerDeviceId);
        res.json({ message: 'Trusted device revoked successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.revokeTrustedDevice = revokeTrustedDevice;
