import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { setupWebSocket } from './websocket';

import authRoutes from './routes/auth';
import deviceRoutes from './routes/devices';
import pairingRoutes from './routes/pairing';
import sessionRoutes from './routes/sessions';
import trustedDeviceRoutes from './routes/trusted-devices';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/pairing', pairingRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/trusted-devices', trustedDeviceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    
    setupWebSocket(server);

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
