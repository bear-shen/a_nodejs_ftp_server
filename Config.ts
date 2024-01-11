const Config = {
    root: '/home',
    account: [
        {name: 'loli', password: 'con'},
    ],
    port: 21,
    host: '0.0.0.0',
    pasv_min: 10000,
    pasv_max: 50000,
    messageTemplate: {
        //https://en.wikipedia.org/wiki/List_of_FTP_server_return_codes
        _220: '220-A FTP Server\r\n220 WELCOME\r\n',
        _331: '331 Please, specify the password.\r\n',
        _430: '430 invalid username or password.\r\n',
        _230: '230 Login successful.\r\n',
        _257: '257 "{0}" is current directory.\r\n',
        _200: '200 Type set to {0}\r\n',
        _227: '227 Entering Passive Mode ({0})\r\n',
        _150: '150 Starting data transfer.\r\n',
        _226: '226 Operation successful.\r\n',
        _250: '250 CWD command successful.\r\n',
        _550: '550 Permission denied.\r\n',
        _504: '504 Command not implemented for that parameter.\r\n',
        _425: 'Can\'t open data connection.\n\r\n',
    } as { [key: string]: string },
};

export default Config;
