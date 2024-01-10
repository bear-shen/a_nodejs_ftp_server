import {DropArgument, Socket} from "net";
import {SessionDef} from "./types";
import Route from "./Route";
import SessionStore from "./SessionStore";
import Config from "./Config";
import {buildTemplate} from "./Lib";

const net = require("node:net");


const server = net.createServer({}, async (socket: Socket) => {
    console.info('server:createServer');
});
server.listen(Config.port, Config.host, async () => {
    console.info('server:listeningListener');
});
server.on('error', async (err: Error) => {
    console.info('server:error', err);
});
server.on('connection', async (socket: Socket) => {
    console.info('server:connection');
    const session = SessionStore.build(socket);
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


console.info('test');

