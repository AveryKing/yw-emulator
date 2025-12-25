"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketRouter = void 0;
const xml2js_1 = require("xml2js");
const SystemController_1 = require("../controllers/SystemController");
const ExtensionController_1 = require("../controllers/ExtensionController");
class PacketRouter {
    constructor() {
        this.parser = new xml2js_1.Parser({
            explicitArray: true, // Keep arrays for consistency
            mergeAttrs: false, // Keep attributes separate in '$'
            trim: true
        });
        this.systemController = new SystemController_1.SystemController();
        this.extensionController = new ExtensionController_1.ExtensionController();
    }
    /**
     * Decodes the incoming XML string and routes it to the appropriate controller.
     */
    async route(client, message) {
        // 1. Handle Policy File Request (Raw string check)
        if (message.includes('<policy-file-request/>')) {
            this.systemController.handlePolicyRequest(client);
            return;
        }
        // 2. Parse XML
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
            if (type === 'sys') {
                this.handleSystemRequest(client, body);
            }
            else if (type === 'xt') {
                this.extensionController.handleExtensionRequest(client, body);
            }
            else {
                console.warn(`[Router] Unknown message type: ${type}`);
            }
        }
        catch (err) {
            console.error(`[Router] XML Parse Error:`, err);
        }
    }
    handleSystemRequest(client, body) {
        const action = body.$?.action;
        switch (action) {
            case 'verChk':
                this.systemController.handleVersionCheck(client, body);
                break;
            case 'login':
                this.systemController.handleLogin(client, body);
                break;
            case 'getRmList':
                this.systemController.handleGetRoomList(client, body);
                break;
            default:
                console.log(`[Router] Unhandled system action: ${action}`);
                break;
        }
    }
}
exports.PacketRouter = PacketRouter;
