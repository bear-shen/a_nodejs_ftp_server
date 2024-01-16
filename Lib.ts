import {SessionDef} from "./types";
import Config from "./Config";
import {Server, Socket} from "net";
import {ReadStream, WriteStream} from "fs";
import fs from "node:fs/promises";

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
    if (offset === -1) return str;
    return str.substring(0, offset);
}

function basename(str: string) {
    str = rtrimSlash(str);
    let offset = str.lastIndexOf('/');
    if (offset === -1) return str;
    return str.substring(offset + 1, str.length);
}

function syncWriteSocket(socket: Socket, str: string) {
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
        if (session.passive && session.passive.server) session.passive.server.close();
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
            //@see https://nodejs.org/docs/latest/api/buffer.html
            // socket.setEncoding('binary');
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
            // socket.on("data", async (buffer: Buffer) => {
            //     console.info('PASV:socket:data');
            // });
        });
        server.listen(validPort, Config.host, async () => {
            console.info('PASV:server.listeningListener', validPort);
            resolve(true);
        });
    });
}

function waitForPassiveSocket(session: SessionDef) {
    return new Promise((resolve, reject) => {
        // console.info(session.passive?.socket);
        if (session.passive && session.passive.socket) return resolve(true);
        let timer = setInterval(() => {
            // console.info(session.passive?.socket);
            if (session.passive && session.passive.socket) {
                clearInterval(timer);
                resolve(true);
            }
        }, 5);
    })
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

function readStream2Socket(socket: Socket, readStream: ReadStream) {
    return new Promise(resolve => {
        readStream.on('data', chunk => {
                // console.info('rs:data')
                // console.info(chunk.toString());
                socket.write(chunk);
            }
        );
        readStream.on('close', () => {
            // console.info('rs:close')
            resolve(true);
        })
    });
}

function socket2writeStream(socket: Socket, writeStream: WriteStream) {
    return new Promise(resolve => {
        socket.on('data', chunk =>
            writeStream.write(chunk)
        );
        socket.on('close', () => {
            resolve(true);
        })
    });
}

async function fileExists(path: string) {
    let ifExs = false;
    try {
        await fs.access(path);
        ifExs = true;
    } catch (e: any) {
        ifExs = false;
    }
    return ifExs;
}

function getRelPath(session: SessionDef, fileName: string) {
    const isAbsolutePath = fileName.indexOf('/') === 0;
    let filePath = '';
    if (isAbsolutePath) {
        filePath = fileName;
    } else {
        filePath = rtrimSlash(session.curPath) + '/' + ltrimSlash(fileName);
    }
    return filePath;
}

function getAbsolutePath(relPath: string) {
    return rtrimSlash(Config.root) + '/' + ltrimSlash(relPath);
}

export {
    login,
    buildTemplate,
    ltrimSlash,
    rtrimSlash,
    dirname,
    basename,
    syncWriteSocket,
    createPasvServer,
    readStream2Socket,
    waitForPassiveSocket,
    socket2writeStream,
    fileExists,
    getRelPath,
    getAbsolutePath,
};
