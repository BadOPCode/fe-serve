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

    emit(eventName: string, data: any) {
        
    }
}
// { default?: SocketIOStatic; listen?: SocketIOStatic; }
export class FakeIO {
    public ioCallback: (socket: FakeSocket) => void;
    public fakeSocket: FakeSocket

    Server() {
        return {
            default: "",
            listen: ""
        }
    }

    $runCallback() {
        this.fakeSocket = new FakeSocket();
        this.ioCallback(this.fakeSocket);
    }

    emit(cmd:string, data:any) {

    }

    on(eventName: string, callback: (socket: FakeSocket) => void ) {
        this.ioCallback = callback;
    }
}

const socketIoOn = (eventName:string, 
    callback:(eventName:string, data:any)=>void) => {
}

export default (server:any) => {
    return new FakeIO();
}
