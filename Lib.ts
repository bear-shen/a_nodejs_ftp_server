import {SessionDef} from "./types";
import Config from "./Config";

async function login(session: SessionDef) {
    const name = session.user;
    const pass = session.pass;
    let matchUn = false;
    let matchPw = false;
    Config.account.forEach(account => {
        if (account.name != name) return;
        matchUn = true;
        if (account.password != pass) return;
        matchPw = true;
    });
    // return matchUn && matchPw;
    if (matchUn && matchPw) {
        session.socket.write(buildTemplate(230));
        session.login = true;
        return;
    }
    session.socket.write(buildTemplate(430));
    return session.login;
}


function buildTemplate(code: number, ...param: (string | number)[]) {
    const key = '_' + code;
    if (!Config.messageTemplate[key]) {
        console.error('invalid msg code:', code, 'param:', param.join(' , '));
        return '';
    }
    let s = Config.messageTemplate[key];
    if (!param.length) return s;
    param.forEach((p, i) => s = s.replace('{' + i + '}', p.toString()));
    return s;
}

export {
    login,
    buildTemplate,
};
