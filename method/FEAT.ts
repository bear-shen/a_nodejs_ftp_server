import {SessionDef} from "../types";
import {buildTemplate} from "../Lib";
import Route from "../Route";

export async function execute(session: SessionDef, buffer: Buffer) {
    return session.socket.write(buildTemplate(211,Object.keys(Route).join('\r\n')+'\r\n'));
}
