import {DropArgument, Socket} from "net";
import {SessionDef} from "./types";
import Route from "./Route";
import SessionStore from "./SessionStore";

const net = require("node:net");

const conf = {
    root: '/home',
    account: [
        {name: 'loli', password: 'con'},
    ],
    port: 21,
    host: '0.0.0.0',
    pasv_min: 10000,
    pasv_max: 50000,
    messageTemplate: {
        //https://en.wikipedia.org/wiki/List_of_FTP_server_return_codes
        _220: '220-A FTP Server\r\n220 WELCOME\r\n',
        _331: '331 Please, specify the password.\r\n',
        _230: '230 Login successful.\r\n',
        _257: '257 "{0}" is current directory.\r\n',
        _200: '200 Type set to I\r\n',
        _227: '227 Entering Passive Mode ({0})\r\n',
        _150: '150 Starting data transfer.\r\n',
        _226: '226 Operation successful.\r\n',
        _250: '250 CWD command successful.\r\n',
        _550: '550 Permission denied.\r\n',
        _504: '504 Command not implemented for that parameter.\r\n',
    } as { [key: string]: string },
};


const server = net.createServer({}, async (socket: Socket) => {
    console.info('server:createServer');
});
server.listen(conf.port, conf.host, async () => {
    console.info('server:listeningListener');
});
server.on('error', async (err: Error) => {
    console.info('server:error', err);
});
server.on('connection', async (socket: Socket) => {
    console.info('server:connection');
    const session=SessionStore.build(socket);
    socket.write(buildTemplate(220));
    socket.on("close", async (hadError: boolean) => {
        console.info('socket:close');
        SessionStore.delete(session.id);
    });
    socket.on("connect", async () => {
        console.info('socket:connect');
    });
    socket.on("data", async (buffer: Buffer) => {
        console.info('socket:data');
        // console.info(data.toString());
        let methodName = '';
        for (let i = 0; i < 5; i++) {
            let char = buffer.readInt8(i);
            if (char == 32) break;
            methodName += String.fromCharCode(char);
        }
        if (!Route[methodName]) {
            session.socket.write(buildTemplate(504));
        }
        Route[methodName](session, buffer);
    });
    socket.on("drain", async () => {
        console.info('socket:drain');
    });
    socket.on("end", async () => {
        console.info('socket:end');
    });
    socket.on("error", async (err: Error) => {
        console.info('socket:error');
    });
    socket.on("lookup", async (err: Error, address: string, family: string | number, host: string) => {
        console.info('socket:lookup');
    });
    socket.on("ready", async () => {
        console.info('socket:ready');
    });
    socket.on("timeout", async (err: Error) => {
        console.info('socket:timeout');
    });
});
server.on('drop', async (data?: DropArgument) => {
    console.info('server:drop');
});
server.on('close', async () => {
    console.info('server:close');
});
server.on('listening', async () => {
    console.info('server:listening');
});

function requestMethod(session: SessionDef, buffer: Buffer) {
}


function buildTemplate(code: number, ...param: (string | number)[]) {
    const key = '_' + code;
    if (!conf.messageTemplate[key]) return '';
    let s = conf.messageTemplate[key];
    if (!param.length) return s;
    param.forEach((p, i) => s = s.replace('{' + i + '}', p.toString()));
    return s;
}

console.info('test');

