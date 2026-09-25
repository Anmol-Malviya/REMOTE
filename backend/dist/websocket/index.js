"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = setupWebSocket;
const ws_1 = require("ws");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const clients = new Map();
function setupWebSocket(server) {
    const wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', (ws) => {
        let connectionId = Math.random().toString(36).substring(7);
        const client = { ws };
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                handleEvent(client, data, connectionId);
            }
            catch (err) {
                console.error('Invalid WS message:', err);
            }
        });
        ws.on('close', () => {
            if (client.deviceId) {
                clients.delete(client.deviceId);
                broadcast({ type: 'DEVICE_OFFLINE', deviceId: client.deviceId });
            }
        });
    });
    function handleEvent(client, data, connectionId) {
        switch (data.type) {
            case 'AUTH':
                try {
                    const decoded = jsonwebtoken_1.default.verify(data.token, JWT_SECRET);
                    client.userId = decoded.userId;
                    client.deviceId = data.deviceId;
                    if (client.deviceId) {
                        clients.set(client.deviceId, client);
                        broadcast({ type: 'DEVICE_ONLINE', deviceId: client.deviceId });
                    }
                    client.ws.send(JSON.stringify({ type: 'AUTH_SUCCESS' }));
                }
                catch (e) {
                    client.ws.send(JSON.stringify({ type: 'AUTH_FAILED' }));
                    client.ws.close();
                }
                break;
            case 'SDP_OFFER':
            case 'SDP_ANSWER':
            case 'ICE_CANDIDATE':
            case 'PAIR_REQUEST':
            case 'PAIR_APPROVED':
            case 'PAIR_REJECTED':
            case 'SESSION_REQUEST':
            case 'SESSION_APPROVED':
            case 'SESSION_REJECTED':
            case 'SESSION_STARTED':
            case 'SESSION_ENDED':
                if (!client.deviceId) {
                    client.ws.send(JSON.stringify({ type: 'ERROR', message: 'Not authenticated' }));
                    return;
                }
                // Route to the target device
                const targetClient = clients.get(data.targetDeviceId);
                if (targetClient) {
                    data.sourceDeviceId = client.deviceId; // inject sender ID
                    targetClient.ws.send(JSON.stringify(data));
                }
                else {
                    client.ws.send(JSON.stringify({ type: 'ERROR', message: 'Target device offline' }));
                }
                break;
            default:
                console.warn('Unknown WS event:', data.type);
        }
    }
    function broadcast(message) {
        const payload = JSON.stringify(message);
        for (const [deviceId, client] of clients.entries()) {
            if (client.ws.readyState === ws_1.WebSocket.OPEN) {
                client.ws.send(payload);
            }
        }
    }
    return wss;
}
