"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const ws_1 = require("ws");
class Client {
    constructor(socket, id) {
        this.username = "";
        this.isAuthenticated = false;
        this.socket = socket;
        this.id = id;
    }
    /**
     * Sends a raw string message to the client.
     * SFS Pro protocol typically appends a null byte (0x00) delimiter,
     * but WebSocket frames handle framing naturally.
     * However, legacy clients might still expect the XML string format.
     */
    send(message) {
        if (this.socket.readyState === ws_1.WebSocket.OPEN) {
            // Some SFS implementations append a null byte.
            // If the client is strictly WebSocket based (IceStone port), it usually expects just the text frame.
            // We will send the plain string as requested by standard WebSocket practices for this port.
            this.socket.send(message);
        }
    }
    /**
     * Helper to send an XML response.
     */
    sendXml(xml) {
        this.send(xml + '\0');
    }
    /**
     * Helper to send a JSON response.
     */
    sendJson(data) {
        this.send(JSON.stringify(data) + '\0');
    }
    getSocket() {
        return this.socket;
    }
}
exports.Client = Client;
