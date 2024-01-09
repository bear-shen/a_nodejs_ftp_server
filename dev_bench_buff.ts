const buffer = Buffer.from('USER SHEN', 'utf-8');
let date: number;
//
date = new Date().valueOf();
console.info(date)
for (let tk = 0; tk < 10000000; tk++) {
    let methodName = '';
    for (let i = 0; i < 5; i++) {
        let char = buffer.readInt8(i);
        if (char == 32) break;
        methodName += String.fromCharCode(char);
    }
}
console.info(new Date().valueOf() - date);
//
date = new Date().valueOf();
console.info(date)
for (let tk = 0; tk < 10000000; tk++) {
    let methodNameArr = [];
    for (let i = 0; i < 5; i++) {
        let char = buffer.readInt8(i);
        if (char == 32) break;
        methodNameArr.push(String.fromCharCode(char));
    }
    let methodName = methodNameArr.join();
}
console.info(new Date().valueOf() - date);
//
date = new Date().valueOf();
console.info(date)
for (let tk = 0; tk < 10000000; tk++) {
    let str = buffer.toString();
    let ind = str.indexOf(' ');
    let methodName = str.substring(0, ind)
}
console.info(new Date().valueOf() - date);
//
date = new Date().valueOf();
console.info(date)
for (let tk = 0; tk < 10000000; tk++) {
    let str = buffer.toString();
    let ind = str.split(' ', 2);
    let methodName = ind[0];
}
console.info(new Date().valueOf() - date);

