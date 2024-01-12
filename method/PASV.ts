import {SessionDef} from "../types";
import {buildTemplate} from "../Lib";
import Config from "../Config";
import {Server, Socket} from "net";
import net from "node:net";

export async function execute(session: SessionDef, buffer: Buffer) {
    await createPasvServer(session);
    let pasvParam = [
        session.socket.localAddress.replace(/\./g, ','),
        Math.floor(session.passive.port / 256),
        session.passive.port % 256
    ];
    session.socket.write(buildTemplate(227, pasvParam.join(',')));
}

const pasvPortSet = new Set<number>;

function createPasvServer(session: SessionDef) {
    return new Promise<any>((resolve, reject) => {
        if (session.passive) session.passive.server.close();
        let validPort = 0;
        for (let i = Config.pasv_min; i <= Config.pasv_max; i++) {
            if (pasvPortSet.has(i)) continue;
            validPort = i;
            break;
        }
        const server: Server = net.createServer({}, async (socket: Socket) => {
            console.info('PASV:server.createServer', validPort);
        });
        session.passive = {
            port: validPort,
            server: server,
        };
        server.listen(validPort, Config.host, async () => {
            console.info('PASV:server.listeningListener', validPort);
            resolve(true);
        });
        server.on('connection', async (socket: Socket) => {
            console.info('PASV:server.connection');
            session.passive.socket = socket;
            socket.on("close", async (hadError: boolean) => {
                console.info('PASV:socket:close');
                session.passive.server.close((err) => {
                    pasvPortSet.delete(session.passive.port);
                    session.passive = null;
                });
            });
            socket.on("connect", async () => {
                console.info('PASV:socket:connect');
            });
            socket.on("data", async (buffer: Buffer) => {
                console.info('PASV:socket:data');
            });
        });
    });
}