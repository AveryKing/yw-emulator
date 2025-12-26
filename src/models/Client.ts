import { WebSocket } from "ws";

export class Client {
  private socket: WebSocket;
  public id: number;
  public username: string = "";
  public isAuthenticated: boolean = false;

  constructor(socket: WebSocket, id: number) {
    this.socket = socket;
    this.id = id;
  }

  /**
   * Sends a raw string message to the client.
   * SFS Pro protocol typically appends a null byte (0x00) delimiter,
   * but WebSocket frames handle framing naturally.
   * However, legacy clients might still expect the XML string format.
   */
  public send(message: string): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      // Some SFS implementations append a null byte.
      // If the client is strictly WebSocket based (IceStone port), it usually expects just the text frame.
      // We will send the plain string as requested by standard WebSocket practices for this port.
      this.socket.send(message);
    }
  }

  /**
   * Helper to send an XML response.
   */
  public sendXml(xml: string): void {
    this.send(xml);
  }

  /**
   * Helper to send a JSON response.
   */
  public sendJson(data: any): void {
    this.send(JSON.stringify(data));
  }

  public getSocket(): WebSocket {
    return this.socket;
  }
}
