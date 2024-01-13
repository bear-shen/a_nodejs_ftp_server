//
import * as fs from "node:fs/promises";

dev_readdir();

async function dev_readdir() {
    const ls = await fs.readdir('/home')
    console.info(ls);
}

//
function dev_buffer() {
    const buffer = Buffer.from('USER SHEN', 'utf-8');
//
    let methodNameArr = [];
    let st = 0;
    for (let i = 0; i < 5; i++) {
        let char = buffer.readInt8(i);
        st = i;
        if (char == 32) break;
        methodNameArr.push(String.fromCharCode(char));
    }
    let methodName = methodNameArr.join();

    const sBuffer = buffer.subarray(st + 1);
    console.info(sBuffer.toString());
}