"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const Client_1 = require("./models/Client");
const PacketRouter_1 = require("./networking/PacketRouter");
const PORT = 9339;
class Server {
    constructor() {
        this.nextClientId = 1;
        this.wss = new ws_1.WebSocketServer({ port: PORT });
        this.router = new PacketRouter_1.PacketRouter();
        this.clients = new Map();
        this.setupServer();
    }
    setupServer() {
        this.wss.on('listening', () => {
            console.log(`[Server] YoWorld Emulator listening on port ${PORT}`);
        });
        this.wss.on('connection', (socket) => {
            this.handleConnection(socket);
        });
    }
    handleConnection(socket) {
        const clientId = this.nextClientId++;
        const client = new Client_1.Client(socket, clientId);
        this.clients.set(clientId, client);
        console.log(`[Server] Client connected. ID: ${clientId}`);
        socket.on('message', (data) => {
            const message = data.toString();
            // console.log(`[Inbound] ${message}`); // Uncomment for debugging
            this.router.route(client, message);
        });
        socket.on('close', () => {
            console.log(`[Server] Client disconnected. ID: ${clientId}`);
            this.clients.delete(clientId);
        });
        socket.on('error', (err) => {
            console.error(`[Server] Client error (ID: ${clientId}):`, err);
        });
    }
}
// Start the server
new Server();
