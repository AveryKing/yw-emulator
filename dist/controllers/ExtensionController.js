"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionController = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ExtensionController {
    /**
     * Handles extension requests (t='xt').
     * These are typically game-specific logic commands.
     */
    handleExtensionRequest(client, body) {
        // Stub for future implementation
        // Example structure: <msg t='xt'><body action='xtReq' r='1'><![CDATA[...]]></body></msg>
        const extensionName = body.$?.xt; // 'xt' attribute on body
        const cmd = body.$?.cmd; // 'cmd' attribute on body
        console.log(`[Extension] Received command '${cmd}' for extension '${extensionName}' from user ${client.username}`);
        // TODO: Implement game logic routing here
    }
    handleJsonRequest(client, data) {
        // console.log(`[Extension] Handling JSON Command: ${data._cmd}`);
        switch (data._cmd) {
            case "activatePlayer":
            case "activatePlayer_YOWO5!":
                this.handleActivatePlayer(client, data);
                break;
            // Handle other commands that might come AFTER login if needed
            case "getRentToBuyItems":
                this.sendXtResponse(client, { _cmd: "getRentToBuyItems", items: [] });
                break;
            default:
                // console.warn(`[Extension] Unhandled JSON command: ${data._cmd}`);
                break;
        }
    }
    handleActivatePlayer(client, data) {
        console.log(`[Extension] Activating player ${client.id} - Replaying FULL Log Sequence...`);
        try {
            // 1. Load the sequence if not already cached
            if (!ExtensionController.cachedLoginSequence) {
                const logPath = path.join(process.cwd(), "YoWorld_Login_1766706231225.json");
                if (!fs.existsSync(logPath)) {
                    console.error(`[Error] Could not find log file at: ${logPath}`);
                    return;
                }
                console.log(`[Extension] Loading log file from: ${logPath}`);
                const rawFile = fs.readFileSync(logPath, "utf8");
                const logJson = JSON.parse(rawFile);
                // Filter only the packets the server SENT to the client
                ExtensionController.cachedLoginSequence = logJson.logs
                    .filter((entry) => entry.dir === "SERVER_RECV")
                    .map((entry) => JSON.parse(entry.payload));
                console.log(`[Extension] Loaded ${ExtensionController.cachedLoginSequence?.length} packets.`);
            }
            // 2. Replay the sequence
            const sequence = ExtensionController.cachedLoginSequence || [];
            let packetCount = 0;
            for (const packet of sequence) {
                // Create a deep copy so we don't mess up the cached original
                const response = JSON.parse(JSON.stringify(packet));
                // --- DYNAMIC ID PATCHING ---
                // The log has the original user's ID. We must replace it with YOUR client ID
                // or the game might reject the data.
                this.recursiveIdPatch(response, client.id);
                // Send the packet
                this.sendXtResponse(client, response);
                packetCount++;
            }
            console.log(`[Extension] Successfully sent ${packetCount} initialization packets.`);
        }
        catch (err) {
            console.error("[Extension] Error replaying login sequence:", err);
        }
    }
    /**
     * Helper to recursively find and replace 'playerId' and 'sessionId'
     * in the massive JSON objects.
     */
    recursiveIdPatch(obj, newId) {
        if (typeof obj !== "object" || obj === null)
            return;
        // Check specific keys we want to patch
        if (obj.hasOwnProperty("playerId")) {
            obj["playerId"] = newId;
        }
        if (obj.hasOwnProperty("sessionId")) {
            obj["sessionId"] = `${newId}_${Date.now()}`;
        }
        // Arrays (iterate through items)
        if (Array.isArray(obj)) {
            for (const item of obj) {
                this.recursiveIdPatch(item, newId);
            }
        }
        // Objects (iterate through keys)
        else {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    this.recursiveIdPatch(obj[key], newId);
                }
            }
        }
    }
    sendXtResponse(client, payload) {
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
exports.ExtensionController = ExtensionController;
// Cache the log data so we don't read the file 100 times
ExtensionController.cachedLoginSequence = null;
