import {SessionDef} from "../types";
import {buildTemplate} from "../Lib";

export default async function execute(session: SessionDef, buffer: Buffer) {
    let prePath = session.curPath;
    session.socket.write(buildTemplate(257, prePath));
}