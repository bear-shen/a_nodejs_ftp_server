import {SessionDef} from "../types";
import {buildTemplate, getAbsolutePath, getRelPath, readStream2Socket, syncWriteSocket, waitForPassiveSocket} from "../Lib";
import * as fsNp from "node:fs";

export async function execute(session: SessionDef, buffer: Buffer) {
    await waitForPassiveSocket(session);
    await syncWriteSocket(session.socket, buildTemplate(150));
    const filePath = getRelPath(session, buffer.toString());
    const rs = fsNp.createReadStream(
        getAbsolutePath(filePath), {
            autoClose: true,
            // start: 0,
            // end: 0,
            encoding: 'binary',
        });
    session.passive.socket.setNoDelay(false);
    await readStream2Socket(session.passive.socket, rs);
    rs.close();
    session.passive.socket.end(() => {
        session.socket.write(buildTemplate(226));
    });
}