import { Client } from "../models/Client";
import { LOGIN_SEQUENCE, rentToBuyItems } from "../data/mockData";

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
    console.log(`[Extension] Starting Login Sequence for ${client.username}`);

    // Iterate through the recorded login sequence
    for (const packet of LOGIN_SEQUENCE) {
      // Create a shallow copy to avoid modifying the original mock data permanently
      // (though for deep objects like 'player', be careful if you need deep cloning)
      let payload = JSON.parse(JSON.stringify(packet));

      // Dynamic Patching for the initial activation packet
      if (payload._cmd === "activatePlayer") {
        payload.playerId = data.playerId || client.id;
        // Generate a session ID if needed, or use the one from the client/server logic
        payload.sessionId = `${payload.playerId}_${Math.floor(
          Date.now() / 1000
        )}`;

        if (client.username) {
          if (payload.player) {
            payload.player.name = client.username;
            payload.player.playerId = payload.playerId;
          }
        }
        console.log(
          `[Extension] Sending activatePlayer response for ID: ${payload.playerId}`
        );
      } else {
        console.log(
          `[Extension] Replaying packet: ${payload._cmd} (ModelID: ${payload.m?.modelID})`
        );
      }

      this.sendXtResponse(client, payload);
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
