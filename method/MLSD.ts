import {SessionDef} from "../types";
import {buildTemplate, dirname, ltrimSlash, rtrimSlash} from "../Lib";
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
    name: string,
};
export default async function execute(session: SessionDef, buffer: Buffer) {
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
    let targetLs: fType[] = [];
    //
    const cDir = await fs.stat(curPath);
    let pPath = dirname(curPath);
    if (pPath.length) {
        const pDir = await fs.stat(pPath);
    }
    //
    const ls = await fs.readdir(curPath);
    return session.socket.write(buildTemplate(226));
}

function fType2Str(fType: fType) {

}

function stat2FType(stat: Stats, fileName: string, dirMode?: 'c' | 'p'): fType | null {
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
        let permStr = 'rf';
        return {
            type: 'file',
            size: stat.size,
            modify: timeStr,
            perm: 'rf',
            name: fileName,
        }
    } else if (stat.isDirectory()) {
        let permStr = '';
        switch (dirMode) {
            default:
                permStr = 'cmpelf';
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
            name: fileName,
        }
    } else {
        return null;
    }

}