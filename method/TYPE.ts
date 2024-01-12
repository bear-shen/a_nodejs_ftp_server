import {SessionDef} from "../types";
import {buildTemplate} from "../Lib";

export async function execute(session: SessionDef, buffer: Buffer) {
    session.mode = buffer.toString();
    session.socket.write(buildTemplate(200, session.mode));
}