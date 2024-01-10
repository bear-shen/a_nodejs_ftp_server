import {Socket} from "net";

type SessionDef = {
    id: number,
    user: string,
    pass: string,
    login: boolean,
    socket: Socket,
    time: number,
    passivePort: Set<number>,
    curPath: string,
    curNode: number,
};