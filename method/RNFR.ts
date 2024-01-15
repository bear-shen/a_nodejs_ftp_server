import {SessionDef} from "../types";
import {buildTemplate, fileExists, getRelPath} from "../Lib";

export async function execute(session: SessionDef, buffer: Buffer) {
    const filePath = getRelPath(session, buffer.toString());
    if (!await fileExists(filePath))
        return session.socket.write(buildTemplate(451));
    session.ext_rnfr = filePath;
    return session.socket.write(buildTemplate(350));
}