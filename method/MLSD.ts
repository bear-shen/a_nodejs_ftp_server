import {SessionDef} from "../types";
import {basename, buildTemplate, dirname, ltrimSlash, rtrimSlash} from "../Lib";
import * as fs from "node:fs/promises";
import {Stats} from "fs";

/**
 * 如果整个目录已成功传输，则接受代码为 226 的 LIST 或 NLST 请求；
 * 如果未建立 TCP 连接，则拒绝 LIST 或 NLST 请求，代码为 425；
 * 如果 TCP 连接已建立但随后被客户端或网络故障中断，则拒绝 LIST 或 NLST 请求，代码为 426；或者
 * 如果服务器在从磁盘读取目录时遇到问题，则拒绝 LIST 或 NLST 请求，代码为 451。
 * */
type fType = {
    type: 'dir' | 'file',
    size?: number,
    modify: string,
    perm: string,
    // name: string,
};
export async function execute(session: SessionDef, buffer: Buffer) {
    if (!session.passive)
        return session.socket.write(buildTemplate(425));
    let withCDir = false;
    let extPath = buffer.toString();
    if (extPath.length) {
        withCDir = true;
        extPath = ltrimSlash(rtrimSlash(extPath));
    }
    let curPath = session.curPath;
    if (withCDir) {
        curPath = rtrimSlash(curPath) + '/' + extPath + '/';
    }
    //
    try {
        await fs.access(curPath);
    } catch (e: any) {
        console.info(`dir not exists ${curPath}`);
        return session.socket.write(buildTemplate(451));
    }
    //
    let targetLs: [string, fType][] = [];
    //
    const cDir = await fs.stat(curPath);
    targetLs.push([basename(curPath), stat2FType(cDir, 'c')]);
    let pPath = dirname(curPath);
    if (pPath.length) {
        const pDir = await fs.stat(pPath);
        targetLs.push([basename(pPath), stat2FType(pDir, 'p')]);
    }
    //
    const ls = await fs.readdir(curPath);
    for (let i = 0; i < ls.length; i++) {
        const f = ls[i];
        const fPath = curPath + f;
        const fStat = await fs.stat(fPath);
        targetLs.push([f, stat2FType(fStat)]);
    }
    targetLs.forEach(f => {
        session.passive.socket.write(fType2Str(f[0], f[1]));
    })
    return session.socket.write(buildTemplate(226));
}

function fType2Str(fName: string, fType: fType) {
    let str = '';
    for (const code in fType) {
        const val = fType[code as keyof fType];
        str += code + '=' + val + ';';
    }
    str += ' ' + fName;
    return str;
}

function stat2FType(stat: Stats, dirMode?: 'c' | 'p'): fType | null {
    let timeArr: (number | string)[] = [
        stat.mtime.getUTCFullYear(),
        stat.mtime.getUTCMonth() + 1,
        stat.mtime.getUTCDate(),
        stat.mtime.getUTCHours(),
        stat.mtime.getUTCMinutes(),
        stat.mtime.getUTCSeconds(),
    ];
    let timeStr = '';
    timeArr.forEach(s => {
        const ss = s.toString();
        timeStr += ss.length < 2 ?
            '0' + ss : ss
    })
    if (stat.isFile()) {
        /**
         * a    APPE    追加+创建
         * d    DELE    删除
         * f    RNFR    重命名
         * r    RETR    下载
         * w    STOR    续传
         * */
        let permStr = 'rf';
        return {
            type: 'file',
            size: stat.size,
            modify: timeStr,
            perm: 'dfr',
            // name: fileName,
        }
    } else if (stat.isDirectory()) {
        let permStr = '';
        /**
         * c    STOU STOR AAPE RNTE 可创建
         * d    DELE    删除
         * e    CWD CDUP    定位
         * f    RNFR    重命名
         * l    LIST NLST MLSD  列表
         * m    MKD 创建文件夹
         * p    RMD 删除文件夹
         * */
        switch (dirMode) {
            default:
                permStr = 'eflm';
                break;
            case 'c':
                permStr = 'el';
                break;
            case 'p':
                permStr = 'e';
                break;
        }
        return {
            type: 'dir',
            modify: timeStr,
            perm: permStr,
            // name: fileName,
        }
    } else {
        return null;
    }

}