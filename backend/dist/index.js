"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const websocket_1 = require("./websocket");
const auth_1 = __importDefault(require("./routes/auth"));
const devices_1 = __importDefault(require("./routes/devices"));
const pairing_1 = __importDefault(require("./routes/pairing"));
const sessions_1 = __importDefault(require("./routes/sessions"));
const trusted_devices_1 = __importDefault(require("./routes/trusted-devices"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/devices', devices_1.default);
app.use('/api/pairing', pairing_1.default);
app.use('/api/sessions', sessions_1.default);
app.use('/api/trusted-devices', trusted_devices_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
const PORT = process.env.PORT || 5000;
async function startServer() {
    try {
        await (0, database_1.connectDatabase)();
        (0, websocket_1.setupWebSocket)(server);
        server.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
