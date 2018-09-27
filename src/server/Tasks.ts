import { ChildProcess, SpawnOptions } from "child_process";
import * as cout from "cout";
import spawn = require("cross-spawn");
import { StringDecoder } from "string_decoder";

export interface ITaskConfig {
    // label to display
    label: string;
    // the command to run
    command: string;
    // arguments to use with command.
    arguments: string[];
    // options for spawn
    options: SpawnOptions;
    // allows multiple instances to run
    singleInstanceOnly: boolean;
    // warm up time in milliseconds to eliminate multiple instance on trigger.
    // 0 to run every trigger. Not used if singleInstanceOnly is true.
    funnelWarmUpTime: number;
    // max amount of time this task should take. 0 = persistant
    maxRunLength: number;
}

export interface ITaskProcess extends ITaskConfig {
    processID: string;
}

declare type TDataCallback = (data: string, lines: number) => void;
declare type TCloseCallback = (code: number) => void;
enum EStatus {
    initialized,
    running,
    stopped,
}

export class Task {
    public config: ITaskConfig;
    public processID: string;
    private _cmd: ChildProcess;
    private _onDataCallbacks: TDataCallback[] = [];
    private _onErrorCallbacks: TDataCallback[] = [];
    private _onCloseCallbacks: TCloseCallback[] = [];
    private _status: EStatus;
    private _warmupTimer: NodeJS.Timer;
    private _timeoutTimer: NodeJS.Timer;

    constructor(options?: ITaskConfig) {
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

    public destroy() {
        this.clearTimeoutTimer();
        this.clearWarmupTimer();
    }

    public execute() {
        try {
            this._warmupTimer = setTimeout(
                this.startExecution,
                this.config.funnelWarmUpTime,
            );
        } catch (err) {
            cout("ERROR EXECUTING TASK:").error();
            cout(err).error();
        }
    }

    public get isRunning() {
        return this._status === EStatus.running;
    }

    public get isStopped() {
        return this._status === EStatus.stopped;
    }

    public get isInitialized() {
        return this._status === EStatus.initialized;
    }

    public write(dataToSend: string) {
        this._cmd.stdin.write(dataToSend);
    }

    public kill() {
        this._cmd.kill();
    }

    public onData(callback: TDataCallback) {
        this._onDataCallbacks.push(callback);
    }

    public onError(callback: TDataCallback) {
        this._onErrorCallbacks.push(callback);
    }

    public onClose(callback: TCloseCallback) {
        this._onCloseCallbacks.push(callback);
    }

    public clearDataListeners() {
        this._onDataCallbacks = [];
    }

    public clearErrorListeners() {
        this._onErrorCallbacks = [];
    }

    public clearCloseListeners() {
        this._onCloseCallbacks = [];
    }

    public clearWarmupTimer() {
        clearTimeout(this._warmupTimer);
    }

    public clearTimeoutTimer() {
        clearTimeout(this._timeoutTimer);
    }

    private startExecution() {
        this._cmd = spawn(this.config.command);
        this._status = EStatus.running;
        const decoder = new StringDecoder("utf8");

        this._cmd.stdout.on("data", (chunk: any) => {
            const strData = decoder.write(chunk);
            const numLines = strData.split("\n").length;
            this.executeDataCallbacks(strData, numLines);
        });

        this._cmd.stderr.on("data", (chunk: any) => {
            const strData = decoder.write(chunk);
            const numLines = strData.split("\n").length;
            this.executeErrorCallbacks(strData, numLines);
        });

        this._cmd.on("close", (code) => {
            this.executeCloseCallbacks(code);
            this._status = EStatus.stopped;
        });
    }

    private executionTimedout() {
    }

    private executeDataCallbacks(strOutput: string, numLines: number) {
        this._onDataCallbacks.forEach((cb: TDataCallback) => {
            cb(strOutput, numLines);
        });
    }

    private executeErrorCallbacks(strOutput: string, numLines: number) {
        this._onErrorCallbacks.forEach((cb: TDataCallback) => {
            cb(strOutput, numLines);
        });
    }

    private executeCloseCallbacks(exitCode: number) {
        this._onCloseCallbacks.forEach((cb: TCloseCallback) => {
            cb(exitCode);
        });
    }
}
