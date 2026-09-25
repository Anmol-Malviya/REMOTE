import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

interface ConnectedClient {
  ws: WebSocket;
  deviceId?: string;
  userId?: string;
}

const clients = new Map<string, ConnectedClient>();

export function setupWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    let connectionId = Math.random().toString(36).substring(7);
    const client: ConnectedClient = { ws };
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        handleEvent(client, data, connectionId);
      } catch (err) {
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

  function handleEvent(client: ConnectedClient, data: any, connectionId: string) {
    switch (data.type) {
      case 'AUTH':
        try {
          const decoded = jwt.verify(data.token, JWT_SECRET) as { userId: string };
          client.userId = decoded.userId;
          client.deviceId = data.deviceId;
          if (client.deviceId) {
            clients.set(client.deviceId, client);
            broadcast({ type: 'DEVICE_ONLINE', deviceId: client.deviceId });
          }
          client.ws.send(JSON.stringify({ type: 'AUTH_SUCCESS' }));
        } catch (e) {
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
        } else {
          client.ws.send(JSON.stringify({ type: 'ERROR', message: 'Target device offline' }));
        }
        break;
      default:
        console.warn('Unknown WS event:', data.type);
    }
  }

  function broadcast(message: any) {
    const payload = JSON.stringify(message);
    for (const [deviceId, client] of clients.entries()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    }
  }

  return wss;
}
