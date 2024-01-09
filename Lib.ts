import {SessionDef} from "./types";

function login(session: SessionDef) {
    const name = session.user;
    const pass = session.pass;
}

export default {
    login: login,
};
