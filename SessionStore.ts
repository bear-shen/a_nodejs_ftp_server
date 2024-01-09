import {Socket} from "net";
import {SessionDef} from "./types";

const sessionStore = new Map<number, SessionDef>();

function genKey(): number {
    const key = (new Date().valueOf() % 10E8) + Math.floor(Math.random() * 10E8);
    if (sessionStore.get(key)) return genKey();
    return key;
}

export default {
    build: function (socket: Socket) {
        const idKey = genKey();
        const session: SessionDef = {
            id: idKey,
            user: '',
            pass: '',
            socket: socket,
            time: (new Date()).valueOf(),
            passivePort: new Set<number>(),
            curPath: '/',
            curNode: 0,
        };
        sessionStore.set(idKey, session);
        return session;
    },
    get: function (sessionId: number) {
        return sessionStore.get(sessionId);
    },
    delete: function (sessionId: number) {
        return sessionStore.delete(sessionId);
    },
}