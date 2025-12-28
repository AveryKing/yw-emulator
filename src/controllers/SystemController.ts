import { Client } from "../models/Client";

export class SystemController {
  public handlePolicyRequest(client: Client): void {
    const policy = `<cross-domain-policy><allow-access-from domain='*' to-ports='9339' /></cross-domain-policy>`;

    client.sendXml(policy);
  }

  public handleVersionCheck(client: Client, body: any): void {
    // 1. Get the version the client sent (e.g., "154")
    // The parser puts attributes in '$' or directly in the object depending on settings.
    // Based on your log: <ver v='154' /> inside <body ...>

    let clientVer = "1.6.6"; // Default fallback
    if (body.ver && body.ver[0] && body.ver[0].$ && body.ver[0].$.v) {
      clientVer = body.ver[0].$.v;
    }

    console.log(
      `[System] Client ${client.id} sent version: ${clientVer}. Echoing it back.`
    );

    // 2. Respond with the EXACT SAME version
    // const response = `<msg t='sys'><body action='verChk' r='0'><ver v='${clientVer}' /></body></msg>`;
    this.handlePolicyRequest(client); // Send policy first
    const apiOkResponse = `<msg t='sys'><body action='apiOK' r='0'></body></msg>`;
    // 3. Send via XML helper
    client.sendXml(apiOkResponse);
  }

  public handleLogin(client: Client, body: any): void {
    console.log(`[System] Client ${client.id} is attempting to login...`);

    const loginResponse = {
      b: {
        r: -1,
        o: {
          mod_level: 0,
          _cmd: "logOK",
          serverUserName: client.id.toString(),
          rk: Math.floor(Math.random() * 1000000000),
          serverTime: Date.now(),
          serverUserId: client.id,
        },
      },
      t: "xt",
    };
    client.sendJson(loginResponse);

    this.handleGetRoomList(client, body);
  }

  public handleGetRoomList(client: Client, body: any): void {
    const roomList = `<msg t='sys'><body action='getRmList' r='0'><rmList><rm id='1' priv='0' temp='0' game='0' max='50' spec='0' lim='0' cnt='1' name='Lobby' /></rmList></body></msg>`;
    client.sendXml(roomList);
  }
}
