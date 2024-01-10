import {SessionDef} from "../types";
import {login} from "../Lib";

export default async function execute(session: SessionDef, buffer: Buffer) {
    session.pass = buffer.toString();
    await login(session);
}