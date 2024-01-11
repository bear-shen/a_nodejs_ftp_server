import {SessionDef} from "./types";
import Config from "./Config";

const net = require("node:net");

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
        session.login = true;
    }
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

function ltrimSlash(str: string) {
    if (str.indexOf('/') !== 0) return str;
    return str.substring(1, str.length);
}

function rtrimSlash(str: string) {
    if (str.lastIndexOf('/') !== str.length - 1) return str;
    return str.substring(0, str.length - 1);
}

function dirname(str: string) {
    str = rtrimSlash(str);
    let offset = str.lastIndexOf('/');
    if (offset === 0 || offset === -1) return str;
    return str.substring(0, offset);
}

function basename(str: string) {
    str = rtrimSlash(str);
    let offset = str.lastIndexOf('/');
    if (offset === 0 || offset === -1) return str;
    return str.substring(offset + 1, str.length);
}

export {
    login,
    buildTemplate,
    ltrimSlash,
    rtrimSlash,
    dirname,
    basename,
};
