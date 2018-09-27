(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "cout", "cross-spawn", "string_decoder"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const cout = require("cout");
    const spawn = require("cross-spawn");
    const string_decoder_1 = require("string_decoder");
    var EStatus;
    (function (EStatus) {
        EStatus[EStatus["initialized"] = 0] = "initialized";
        EStatus[EStatus["running"] = 1] = "running";
        EStatus[EStatus["stopped"] = 2] = "stopped";
    })(EStatus || (EStatus = {}));
    class Task {
        constructor(options) {
            this._onDataCallbacks = [];
            this._onErrorCallbacks = [];
            this._onCloseCallbacks = [];
            this.config = options || {
                arguments: [],
                command: "",
                funnelWarmUpTime: 0,
                label: "",
                maxRunLength: 0,
                options: undefined,
                singleInstanceOnly: false,
            };
            this._status = EStatus.initialized;
            this.executeCloseCallbacks = this.executeCloseCallbacks.bind(this);
            // this.executeDataCallbacks = this.executeCloseCallbacks.bind(this);
            // this.executeErrorCallbacks = this.executeErrorCallbacks.bind(this);
            // this.executionTimedout = this.executionTimedout.bind(this);
            this.startExecution = this.startExecution.bind(this);
        }
        destroy() {
            this.clearTimeoutTimer();
            this.clearWarmupTimer();
        }
        execute() {
            try {
                this._warmupTimer = setTimeout(this.startExecution, this.config.funnelWarmUpTime);
            }
            catch (err) {
                cout("ERROR EXECUTING TASK:").error();
                cout(err).error();
            }
        }
        get isRunning() {
            return this._status === EStatus.running;
        }
        get isStopped() {
            return this._status === EStatus.stopped;
        }
        get isInitialized() {
            return this._status === EStatus.initialized;
        }
        write(dataToSend) {
            this._cmd.stdin.write(dataToSend);
        }
        kill() {
            this._cmd.kill();
        }
        onData(callback) {
            this._onDataCallbacks.push(callback);
        }
        onError(callback) {
            this._onErrorCallbacks.push(callback);
        }
        onClose(callback) {
            this._onCloseCallbacks.push(callback);
        }
        clearDataListeners() {
            this._onDataCallbacks = [];
        }
        clearErrorListeners() {
            this._onErrorCallbacks = [];
        }
        clearCloseListeners() {
            this._onCloseCallbacks = [];
        }
        clearWarmupTimer() {
            clearTimeout(this._warmupTimer);
        }
        clearTimeoutTimer() {
            clearTimeout(this._timeoutTimer);
        }
        startExecution() {
            this._cmd = spawn(this.config.command);
            this._status = EStatus.running;
            const decoder = new string_decoder_1.StringDecoder("utf8");
            this._cmd.stdout.on("data", (chunk) => {
                const strData = decoder.write(chunk);
                const numLines = strData.split("\n").length;
                this.executeDataCallbacks(strData, numLines);
            });
            this._cmd.stderr.on("data", (chunk) => {
                const strData = decoder.write(chunk);
                const numLines = strData.split("\n").length;
                this.executeErrorCallbacks(strData, numLines);
            });
            this._cmd.on("close", (code) => {
                this.executeCloseCallbacks(code);
                this._status = EStatus.stopped;
            });
        }
        executionTimedout() {
        }
        executeDataCallbacks(strOutput, numLines) {
            this._onDataCallbacks.forEach((cb) => {
                cb(strOutput, numLines);
            });
        }
        executeErrorCallbacks(strOutput, numLines) {
            this._onErrorCallbacks.forEach((cb) => {
                cb(strOutput, numLines);
            });
        }
        executeCloseCallbacks(exitCode) {
            this._onCloseCallbacks.forEach((cb) => {
                cb(exitCode);
            });
        }
    }
    exports.Task = Task;
});
