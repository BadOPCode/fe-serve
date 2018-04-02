/**
 * socket.io.mocks.ts:
 * This module is designed to add a functional mock to the Socket.io
 * dependency using Rewiremock.
 */
import rewiremock from "rewiremock";
import * as socketio from "socket.io";

export class FakeSocket {
    Server() {}
    on(eventName: string, callback: ()=>void ): void {

    }
}
// { default?: SocketIOStatic; listen?: SocketIOStatic; }
export class FakeIO {
    Server() {
        return {
            default: "",
            listen: ""
        }
    }
    on(eventName: string, callback: (socket: FakeSocket) => void ) {

    }
}

const socketIoOn = (eventName:string, 
    callback:(eventName:string, data:any)=>void) => {
}

export default (server:any) => {
    return new FakeIO();
}
