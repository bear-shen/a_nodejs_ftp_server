import {SessionDef} from "./types";

const Route: { [key: string]: (session: SessionDef, buffer: Buffer) => any } = {
    USER: require('./method/USER').execute,
    PASS: require('./method/PASS').execute,
    // ACCT: require('./method/ACCT').execute,
    TYPE: require('./method/TYPE').execute,
    // STRU: require('./method/STRU').execute,
    // MODE: require('./method/MODE').execute,
    // CWD: require('./method/CWD').execute,
    PWD: require('./method/PWD').execute,
    XPWD: require('./method/PWD').execute,
    // CDUP: require('./method/CDUP').execute,
    PASV: require('./method/PASV').execute,
    // RETR: require('./method/RETR').execute,
    // REST: require('./method/REST').execute,
    // PORT: require('./method/PORT').execute,
    LIST: require('./method/MLSD').execute,
    // NLST: require('./method/NLST').execute,
    MLSD: require('./method/MLSD').execute,
    // QUIT: require('./method/QUIT').execute,
    // SYST: require('./method/SYST').execute,
    // STAT: require('./method/STAT').execute,
    // HELP: require('./method/HELP').execute,
    // NOOP: require('./method/NOOP').execute,
    // STOR: require('./method/STOR').execute,
    // APPE: require('./method/APPE').execute,
    // STOU: require('./method/STOU').execute,
    // ALLO: require('./method/ALLO').execute,
    // MKD: require('./method/MKD').execute,
    // RMD: require('./method/RMD').execute,
    // DELE: require('./method/DELE').execute,
    // RNFR: require('./method/RNFR').execute,
    // RNTO: require('./method/RNTO').execute,
};

export default Route;
