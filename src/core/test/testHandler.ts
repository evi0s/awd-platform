import { Handler } from '../Handler'
import { HandlerEventLoop } from "../Midware";
import { expect } from 'chai'


describe('Handler', () => {

    it('Handler Test #1', () => {
        let test = new Handler('0.0.0.0', 8090, 1);
        HandlerEventLoop.on('newData', (server: string, socket: string, data: string) => {
            console.log(`Got new data: ${data}, from server id: ${server}, socket id: ${socket}`);
        });
    });

});
