import {SessionDef} from "../types";
import {buildTemplate} from "../Lib";
import config from "../Config";

/**
 * AUTH TLS
 * AUTH SSL
 * */
export async function execute(session: SessionDef, buffer: Buffer) {
    const crypto = buffer.toString();
    if (crypto != 'TLS' || !config.tls) return session.socket.write(buildTemplate(504));
    session.socket.write(buildTemplate(234));
}