import {SessionDef} from "./types";

const Route: { [key: string]: (session: SessionDef, buffer: Buffer) => any } = {
    USER: require('method/USER'),
    PASS: require('method/PASS'),
    // ACCT: require('method/ACCT'),
    // TYPE: require('method/TYPE'),
    // STRU: require('method/STRU'),
    // MODE: require('method/MODE'),
    // CWD: require('method/CWD'),
    PWD: require('method/PWD'),
    XPWD: require('method/PWD'),
    // CDUP: require('method/CDUP'),
    // PASV: require('method/PASV'),
    // RETR: require('method/RETR'),
    // REST: require('method/REST'),
    // PORT: require('method/PORT'),
    // LIST: require('method/LIST'),
    // NLST: require('method/NLST'),
    // QUIT: require('method/QUIT'),
    // SYST: require('method/SYST'),
    // STAT: require('method/STAT'),
    // HELP: require('method/HELP'),
    // NOOP: require('method/NOOP'),
    // STOR: require('method/STOR'),
    // APPE: require('method/APPE'),
    // STOU: require('method/STOU'),
    // ALLO: require('method/ALLO'),
    // MKD: require('method/MKD'),
    // RMD: require('method/RMD'),
    // DELE: require('method/DELE'),
    // RNFR: require('method/RNFR'),
    // RNTO: require('method/RNTO'),
};

export default Route;
