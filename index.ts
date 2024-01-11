import {DropArgument, Server, Socket} from "net";
import {SessionDef} from "./types";
import Route from "./Route";
import SessionStore from "./SessionStore";
import Config from "./Config";
import {buildTemplate} from "./Lib";

const net = require("node:net");


const server: Server = net.createServer({}, async (socket: Socket) => {
    console.info('server:createServer');
});
server.listen(Config.port, Config.host, async () => {
    console.info('server:listeningListener');
});
server.on('error', async (err: Error) => {
    console.info('server:error', err);
});
/**
 * socket:
 * ready -> connect -> data
 * drain
 * error
 * lookup
 * timeout
 * end -> close
 * */
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
        let st = 0;
        for (let i = 0; i < 5; i++) {
            let char = buffer.readInt8(i);
            st = i;
            if (char == 32) break;
            methodName += String.fromCharCode(char);
        }
        if (!Route[methodName]) {
            session.socket.write(buildTemplate(504));
        }
        const sBuffer = buffer.subarray(st + 1);
        Route[methodName](session, sBuffer);
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

