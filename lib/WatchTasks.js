(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "cout", "fs", "glob-watcher", "uuid", "./TaskManager"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const cout = require("cout");
    const fs = require("fs");
    const watch = require("glob-watcher");
    const uuid_1 = require("uuid");
    const TaskManager_1 = require("./TaskManager");
    // const runner = new RunSpout();
    // runner.run();
    class WatchTask {
        constructor(web) {
            this.web = web;
            this.taskMgr = new TaskManager_1.TaskManager();
        }
        processCommand(cmd, path, stats) {
            let taskCmd = cmd;
            const id = uuid_1.v4();
            const pathStat = (stats ? stats : fs.lstatSync(path));
            const taskOptions = {
                arguments: [],
                command: "",
                funnelWarmUpTime: 0,
                label: "",
                maxRunLength: 0,
                options: {},
                singleInstanceOnly: false,
            };
            let fileType;
            if (pathStat.isBlockDevice()) {
                fileType = "block";
            }
            if (pathStat.isCharacterDevice()) {
                fileType = "char";
            }
            if (pathStat.isDirectory()) {
                fileType = "dir";
            }
            if (pathStat.isFIFO()) {
                fileType = "fifo";
            }
            if (pathStat.isFile()) {
                fileType = "file";
            }
            if (pathStat.isSocket()) {
                fileType = "socket";
            }
            if (pathStat.isSymbolicLink()) {
                fileType = "link";
            }
            taskCmd = taskCmd.replace(/{file}/g, path)
                .replace(/{type}/g, fileType)
                .replace(/{mode}/g, "" + pathStat.mode)
                .replace(/{size}/g, "" + pathStat.size)
                .replace(/{atime}/g, "" + pathStat.atimeMs)
                .replace(/{mtime}/g, "" + pathStat.mtimeMs)
                .replace(/{ctime}/g, "" + pathStat.ctimeMs)
                .replace(/{btime}/g, "" + pathStat.birthtimeMs);
            cout(`Task triggered running: ${cmd}`).verbose();
            if (taskCmd.charAt(1) === "!") {
                // if banged than use pre-defined task.
                // lets strip the bang off
                taskCmd = taskCmd.substr(1);
            }
            else {
                // taskCmd is not banged so lets generate a task definition
                this.taskMgr.putTaskDefinition({
                    // default watch task
                    arguments: [],
                    command: taskCmd,
                    funnelWarmUpTime: 0,
                    label: taskCmd,
                    maxRunLength: 0,
                    options: {},
                    singleInstanceOnly: true,
                });
            }
            const task = this.taskMgr.create(taskCmd);
            if (task) {
                task.onClose((code) => {
                    this.web.io.emit(`console`, {
                        type: "close",
                        cmd: taskCmd,
                        code,
                        id,
                        timeStamp: (new Date()).toISOString(),
                    });
                    cout(`Completed running "${taskCmd}"`).verbose();
                });
                task.onData((output, numLines) => {
                    this.web.io.emit(`console`, {
                        type: "data",
                        cmd: taskCmd,
                        data: output,
                        id,
                        lines: numLines,
                        timeStamp: (new Date()).toISOString(),
                    });
                });
                task.onError((output, numLines) => {
                    cout("data", output).error();
                    this.web.io.emit(`console`, {
                        type: "error",
                        cmd: taskCmd,
                        data: output,
                        id,
                        lines: numLines,
                        timeStamp: (new Date()).toISOString(),
                    });
                });
                task.execute();
                cout(`Executing "${taskCmd}"`).verbose();
            }
            else {
                cout(`Trigger "${taskCmd}" ignored`);
            }
        }
        processConfig(config) {
            this.pvtConfig = config;
            this.queue = [];
            if (!!this.pvtConfig.watchTasks) {
                this.pvtConfig.watchTasks.forEach((task) => {
                    const newWatch = watch(task.masks);
                    cout(`Watching path ${task.masks}`).verbose();
                    if (task.tasks.any) {
                        newWatch.on("add", (path, stat) => this.processCommand(task.tasks.any, path, stat));
                        newWatch.on("change", (path, stat) => this.processCommand(task.tasks.any, path, stat));
                        newWatch.on("unlink", (path, stat) => this.processCommand(task.tasks.any, path, stat));
                    }
                    if (task.tasks.onAdd) {
                        newWatch.on("add", (path, stat) => this.processCommand(task.tasks.onAdd, path, stat));
                    }
                    if (task.tasks.onChange) {
                        newWatch.on("change", (path, stat) => this.processCommand(task.tasks.onChange, path, stat));
                    }
                    if (task.tasks.onDelete) {
                        newWatch.on("unlink", (path, stat) => this.processCommand(task.tasks.onDelete, path, stat));
                    }
                    this.queue.push(newWatch);
                });
            }
        }
    }
    exports.WatchTask = WatchTask;
});
