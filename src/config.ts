// Project global config

let env = process.env;


let listenaddr   = env.LISTENADDR               || '127.0.0.1';
let listenport   = parseInt(env.LISTENPORT)     ||  3000;


export {
    listenaddr,
    listenport
}
