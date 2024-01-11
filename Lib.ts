import {SessionDef} from "./types";
import Config from "./Config";
import {Server, Socket} from "net";
import SessionStore from "./SessionStore";
import Promise = require("Promise");

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


export {
    login,
    buildTemplate,
};
