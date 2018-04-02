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
    }
    exports.FakeSocket = FakeSocket;
    class FakeIO {
        on(eventName, callback) {
        }
    }
    exports.FakeIO = FakeIO;
    const socketIoOn = (eventName, callback) => {
    };
    exports.default = (server) => {
        return new FakeIO();
    };
});
