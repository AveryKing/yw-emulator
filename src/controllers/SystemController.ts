import { Client } from '../models/Client';

export class SystemController {
    
    /**
     * Handles the <policy-file-request/> sent by Flash/IceStone clients.
     * Returns a permissive cross-domain policy to allow connections.
     */
    public handlePolicyRequest(client: Client): void {
        const policy = `
            <cross-domain-policy>
                <allow-access-from domain="*" to-ports="*" />
            </cross-domain-policy>
        `.trim();
        client.send(policy);
    }

    /**
     * Handles the 'verChk' (Version Check) action.
     * SFS Pro expects a success response (r='0') to proceed.
     */
    public handleVersionCheck(client: Client, body: any): void {
        // Response format: <msg t='sys'><body action='verChk' r='0'><ver v='1.6.6' /></body></msg>
        const response = `<msg t='sys'><body action='verChk' r='0'><ver v='1.6.6' /></body></msg>`;
        client.sendXml(response);
    }

    /**
     * Handles the 'login' action.
     * Parses credentials (simplified for emulation) and returns the user object.
     */
    public handleLogin(client: Client, body: any): void {
        // Extract username from the login body
        // Structure usually: <login z='zone'><nick><![CDATA[name]]></nick>...</login>
        let username = 'Guest';
        
        if (body.login && body.login[0] && body.login[0].nick) {
            username = body.login[0].nick[0];
        }

        client.username = username;
        client.isAuthenticated = true;

        // SFS Pro Login Response
        // Includes user ID, name, mod status, admin status.
        const response = `
            <msg t='sys'>
                <body action='login' r='0'>
                    <login z='YoWorld'>
                        <nick><![CDATA[${username}]]></nick>
                        <id>${client.id}</id>
                        <mod>0</mod>
                        <admin>0</admin>
                    </login>
                </body>
            </msg>
        `.replace(/\s+/g, ' '); // Minify for network efficiency

        client.sendXml(response);
    }

    /**
     * Handles the 'getRmList' (Get Room List) action.
     * Returns an empty room list to satisfy the client handshake sequence.
     */
    public handleGetRoomList(client: Client, body: any): void {
        // Structure: <msg t='sys'><body action='getRmList' r='0'><rmList></rmList></body></msg>
        const response = `<msg t='sys'><body action='getRmList' r='0'><rmList></rmList></body></msg>`;
        client.sendXml(response);
    }
}
