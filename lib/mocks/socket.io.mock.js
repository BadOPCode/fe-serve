(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FakeSocket {
        Server() { }
        on(eventName, callback) {
        }
        emit(eventName, data) {
        }
    }
    exports.FakeSocket = FakeSocket;
    // { default?: SocketIOStatic; listen?: SocketIOStatic; }
    class FakeIO {
        Server() {
            return {
                default: "",
                listen: ""
            };
        }
        $runCallback() {
            this.fakeSocket = new FakeSocket();
            this.ioCallback(this.fakeSocket);
        }
        emit(cmd, data) {
        }
        on(eventName, callback) {
            this.ioCallback = callback;
        }
    }
    exports.FakeIO = FakeIO;
    const socketIoOn = (eventName, callback) => {
    };
    exports.default = (server) => {
        return new FakeIO();
    };
});
