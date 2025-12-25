import { Client } from '../models/Client';

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

        console.log(`[Extension] Received command '${cmd}' for extension '${extensionName}' from user ${client.username}`);
        
        // TODO: Implement game logic routing here
    }
}
