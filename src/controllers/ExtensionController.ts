import { Client } from "../models/Client";
import {
  activatePlayerResponse,
  modelResponses,
  rentToBuyItems,
} from "../data/mockData";

export class ExtensionController {
  /**
   * Handles extension requests (t='xt').
   * These are typically game-specific logic commands.
   */
  public handleExtensionRequest(client: Client, body: any): void {
    // Stub for future implementation
    // Example structure: <msg t='xt'><body action='xtReq' r='1'><![CDATA[...]]></body></msg>

    const extensionName = body.$?.xt; // 'xt' attribute on body
    const cmd = body.$?.cmd; // 'cmd' attribute on body

    console.log(
      `[Extension] Received command '${cmd}' for extension '${extensionName}' from user ${client.username}`
    );

    // TODO: Implement game logic routing here
  }

  /**
   * Handles JSON-based extension requests.
   */
  public handleJsonRequest(client: Client, data: any): void {
    const cmd = data._cmd;

    console.log(
      `[Extension] Received JSON command '${cmd}' from user ${client.username}`
    );

    switch (cmd) {
      case "activatePlayer":
      case "activatePlayer_YOWO5!":
        this.handleActivatePlayer(client, data);
        break;
      case "sendMessage":
        // Example: { "_cmd": "sendMessage", "msg": "Hello World", "recipient": ... }
        console.log(`[Chat] ${client.username}: ${data.msg}`);
        break;
      case "updateCharacterPath":
        // Example: { "_cmd": "updateCharacterPath", "x": 100, "y": 200, ... }
        console.log(
          `[Movement] ${client.username} moved to (${data.x}, ${data.y})`
        );
        break;
      case "getRentToBuyItems":
        this.handleGetRentToBuyItems(client);
        break;
      default:
        console.log(`[Extension] Unhandled JSON command: ${cmd}`);
        break;
    }
  }

  private handleActivatePlayer(client: Client, data: any): void {
    // 1. Send activatePlayer response
    // We use the mock data but override the playerId to match the request if needed
    const response = {
      ...activatePlayerResponse,
      playerId: data.playerId || client.id,
      sessionId: `${data.playerId || client.id}_${Math.floor(
        Date.now() / 1000
      )}`,
    };

    // Override player name if available
    if (client.username) {
      response.player.name = client.username;
    }

    this.sendXtResponse(client, response);

    // 2. Send sequence of ModelStore.modelResponse packets
    // These are sent immediately after activation to load game data
    for (const modelResponse of modelResponses) {
      this.sendXtResponse(client, modelResponse);
    }
  }

  private handleGetRentToBuyItems(client: Client): void {
    const response = {
      _cmd: "getRentToBuyItems",
      items: rentToBuyItems,
    };
    this.sendXtResponse(client, response);
  }

  /**
   * Wraps the payload in the SmartFoxServer "XT" envelope and sends it as JSON.
   */
  private sendXtResponse(client: Client, payload: any): void {
    const wrapper = {
      t: "xt",
      b: {
        r: -1,
        o: payload,
      },
    };
    client.sendJson(wrapper);
  }
}
