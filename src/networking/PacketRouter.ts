import { Parser } from "xml2js";
import { Client } from "../models/Client";
import { SystemController } from "../controllers/SystemController";
import { ExtensionController } from "../controllers/ExtensionController";

export class PacketRouter {
  private parser: Parser;
  private systemController: SystemController;
  private extensionController: ExtensionController;

  constructor() {
    this.parser = new Parser({
      explicitArray: true, // Keep arrays for consistency
      mergeAttrs: false, // Keep attributes separate in '$'
      trim: true,
    });
    this.systemController = new SystemController();
    this.extensionController = new ExtensionController();
  }

  /**
   * Decodes the incoming XML string and routes it to the appropriate controller.
   */
  public async route(client: Client, message: string): Promise<void> {
    // 1. Handle Policy File Request (Raw string check)
    if (message.includes("<policy-file-request/>")) {
      this.systemController.handlePolicyRequest(client);
      return;
    }

    const firstChar = message.trim().charAt(0);

    // 2. Handle JSON Packets
    if (firstChar === "{") {
      try {
        const jsonObj = JSON.parse(message);
        this.extensionController.handleJsonRequest(client, jsonObj);
      } catch (err) {
        console.error(`[Router] JSON Parse Error:`, err);
      }
      return;
    }

    // 3. Handle XML Packets
    if (firstChar === "<") {
      try {
        const result = await this.parser.parseStringPromise(message);

        // Root tag should be <msg>
        if (!result.msg) {
          console.warn(`[Router] Invalid root tag received from ${client.id}`);
          return;
        }

        const msg = result.msg;
        const type = msg.$?.t; // 't' attribute: 'sys' or 'xt'
        const body = msg.body ? msg.body[0] : null;

        if (!body) {
          return;
        }

        if (type === "sys") {
          this.handleSystemRequest(client, body);
        } else if (type === "xt") {
          this.extensionController.handleExtensionRequest(client, body);
        } else {
          console.warn(`[Router] Unknown message type: ${type}`);
        }
      } catch (err) {
        console.error(`[Router] XML Parse Error:`, err);
      }
      return;
    }

    console.warn(
      `[Router] Unknown packet format from ${client.id}: ${message.substring(
        0,
        50
      )}...`
    );
  }

  private handleSystemRequest(client: Client, body: any): void {
    const action = body.$?.action;

    switch (action) {
      case "verChk":
        this.systemController.handleVersionCheck(client, body);
        break;
      case "login":
        this.systemController.handleLogin(client, body);
        break;
      case "getRmList":
        this.systemController.handleGetRoomList(client, body);
        break;
      default:
        console.log(`[Router] Unhandled system action: ${action}`);
        break;
    }
  }
}
