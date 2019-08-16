import * as debug from "debug"
import * as net from "net";
import { HandlerEventLoop } from "./Midware";

const Debugger = debug('Handler');


class Socket {
    private readonly id: number;
    private readonly socket: net.Socket;
    private readonly host: net.AddressInfo | string;
    private readonly status: boolean;
    private readonly serverId: number;

    constructor(_id: number, _socket: net.Socket, _serverId: number) {
        this.id = _id;
        this.socket = _socket;
        this.serverId = _serverId;
        this.host = this.socket.address();
        this.status = this.socket.destroyed;

        if (typeof this.host !== "string") {
            Debugger(`Got new socket id: ${this.id}, host: ${this.host.address}, on port: ${this.host.port}`);
        } else {
            Debugger(`Got new socket id: ${this.id}, host: ${this.host}`);
        }

        // Event: data
        this.socket.on('data', this.DataHandler.bind(this));

        // Event: close
        this.socket.on('close', Socket.CloseHandler);

        // Event: error
        this.socket.on('error', Socket.ErrorHandler);

    }

    public getId () {
        return this.id;
    }

    public getSocket () {
        return this.socket;
    }

    public getHost () {
        return this.host;
    }

    public getStatus() {
        return this.status;
    }

    private DataHandler (data: Buffer) {
        Debugger(`Got new data: ${data.toString('utf-8')}`);
        HandlerEventLoop.emit('newData', this.serverId, this.id, data.toString('utf-8'));
    }

    private static CloseHandler () {
        console.log('Closing socket...');
    }

    private static ErrorHandler (error: Error) {
        Debugger(`Error: ${error.message}`);
        console.log("An error has occurred!");
    }

    public sendData(data: string) {
        this.socket.write(Buffer.from(data));
    }
}


class Handler {
    public id  : number;
    public host: string;
    public port: number;
    public clientNum: number;

    private readonly Server: net.Server;
    private Sockets: Array<Socket>;


    constructor(_host: string, _port: number, _id: number) {
        Debugger(`Handler server Host: ${_host}, Port: ${_port}`);
        this.host = _host;
        this.port = _port;
        this.id   = _id;
        this.clientNum = 0;
        this.Sockets = new Array<Socket>();

        // Creating server
        this.Server = net.createServer();
        this.Server.listen(this.port, this.host);

        // Event: connection
        this.Server.on('connection', this.ConnectionHandler.bind(this));

        // Event: error
        this.Server.on('error', Handler.ErrorHandler);

        // Event: close
        this.Server.on('close', Handler.CloseHandler);
    }

    private ConnectionHandler (socket: net.Socket) {

        // Get client object
        let client = new Socket(this.clientNum, socket, this.id);

        // Push current socket into array
        this.Sockets.push(client);
        this.clientNum += 1;
    }

    private static CloseHandler () {
        console.log('Closing server...');
    }

    private static ErrorHandler (error: Error) {
        Debugger(`Error: ${error.message}`);
        console.log("An error has occurred!");
    }

    public getServer (): net.Server {
        return this.Server;
    }

    public getSockets (): Array<Socket> {
        return this.Sockets;
    }

    public getId(): number {
        return this.id;
    }

    public getClientNumber (): number {
        return this.clientNum;
    }

    public closeServer () {

        // Closing socket
        for (let idx in this.Sockets) {
            this.Sockets[idx].getSocket().end();
        }

        // Closing server
        this.Server.close();
    }

    public sendToSocket(_id: number, data: string) {

        // Check socket id
        if (_id > this.clientNum) {
            throw new Error(`Invalid socket id: ${_id}`);
        }

        // Check socket status
        if (this.Sockets[_id].getStatus()) {
            throw new Error(`Socket ${_id} has closed!`);
        }

        this.Sockets[_id].sendData(data);
    }
}

export { Handler }
