import { WebSocketServer, WebSocket } from "ws";
import { Client } from "./models/Client";
import { PacketRouter } from "./networking/PacketRouter";

const PORT = 9339;

class Server {
  private wss: WebSocketServer;
  private router: PacketRouter;
  private clients: Map<number, Client>;
  private nextClientId: number = 1;

  constructor() {
    this.wss = new WebSocketServer({ port: PORT });
    this.router = new PacketRouter();
    this.clients = new Map();

    this.setupServer();
  }

  private setupServer(): void {
    this.wss.on("listening", () => {
      console.log(`[Server] YoWorld Emulator listening on port ${PORT}`);
    });

    this.wss.on("connection", (socket: WebSocket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: WebSocket): void {
    const clientId = this.nextClientId++;
    const client = new Client(socket, clientId);
    this.clients.set(clientId, client);

    console.log(`[Server] Client connected. ID: ${clientId}`);

    socket.on("message", (data: Buffer) => {
      const message = data.toString();
      console.log(`[Inbound] ${message}`); // Uncomment for debugging
      this.router.route(client, message);
    });

    socket.on("close", () => {
      console.log(`[Server] Client disconnected. ID: ${clientId}`);
      this.clients.delete(clientId);
    });

    socket.on("error", (err) => {
      console.error(`[Server] Client error (ID: ${clientId}):`, err);
    });
  }
}

// Start the server
new Server();
