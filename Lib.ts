import {SessionDef} from "./types";
import Config from "./Config";
import {Server, Socket} from "net";

const net = require("node:net");

async function login(session: SessionDef) {
    const name = session.user;
    const pass = session.pass;
    let matchUn = false;
    let matchPw = false;
    console.info(name, pass);
    console.info(Config.account);
    Config.account.forEach(account => {
        if (account.name != name) return;
        matchUn = true;
        if (account.password != pass) return;
        matchPw = true;
    });
    // return matchUn && matchPw;
    if (matchUn && matchPw) {
        session.login = true;
    }
    return session.login;
}


function buildTemplate(code: number, ...param: (string | number)[]) {
    const key = '_' + code;
    if (!Config.messageTemplate[key]) {
        console.error('invalid msg code:', code, 'param:', param.join(' , '));
        return '';
    }
    let s = Config.messageTemplate[key];
    if (!param.length) return s;
    param.forEach((p, i) => s = s.replace('{' + i + '}', p.toString()));
    return s;
}

function ltrimSlash(str: string) {
    if (str.indexOf('/') !== 0) return str;
    return str.substring(1, str.length);
}

function rtrimSlash(str: string) {
    if (str.lastIndexOf('/') !== str.length - 1) return str;
    return str.substring(0, str.length - 1);
}

function dirname(str: string) {
    str = rtrimSlash(str);
    let offset = str.lastIndexOf('/');
    if (offset === 0 || offset === -1) return str;
    return str.substring(0, offset);
}

function basename(str: string) {
    str = rtrimSlash(str);
    let offset = str.lastIndexOf('/');
    if (offset === 0 || offset === -1) return str;
    return str.substring(offset + 1, str.length);
}

function syncWrite(socket: Socket, str: string) {
    if (!socket) return;
    return new Promise(resolve => {
        socket.write(
            str, err => resolve(null)
        );
    })
}

const pasvPortSet = new Set<number>;

function createPasvServer(session: SessionDef) {
    return new Promise<any>(async (resolve, reject) => {
        if (session.passive) session.passive.server.close();
        let validPort = 0;
        for (let i = Config.pasv_min; i <= Config.pasv_max; i++) {
            if (pasvPortSet.has(i)) continue;
            if (!await isPortAvailable(i)) continue;
            validPort = i;
            break;
        }
        pasvPortSet.add(validPort);
        const server: Server = net.createServer({}, async (socket: Socket) => {
            console.info('PASV:server.createServer', validPort);
        });
        session.passive = {
            port: validPort,
            server: server,
        };
        server.on('connection', async (socket: Socket) => {
            console.info('PASV:server.connection');
            session.passive.socket = socket;
            socket.setNoDelay(true);
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
        server.listen(validPort, Config.host, async () => {
            console.info('PASV:server.listeningListener', validPort);
            resolve(true);
        });
    });
}

/**
 * @see https://github.com/colxi/is-port-available/blob/master/index.js
 * */
function isPortAvailable(port: number): Promise<boolean> {
    return new Promise(resolve => {
        // if port is not a number or is not an integet or is out of range block
        if (isNaN(port) || port < 0 || port > 65536) {
            resolve(false);
        }
        const tester = net.createServer()
            // catch errors, and resolve false
            .once('error', (err: Error) => {
                resolve(false);
            })
            // return true if succed
            .once('listening', () =>
                tester.once('close', () =>
                    resolve(true)
                ).close()
            )
            .listen(port);
    });
}

export {
    login,
    buildTemplate,
    ltrimSlash,
    rtrimSlash,
    dirname,
    basename,
    syncWrite,
    createPasvServer,
};
