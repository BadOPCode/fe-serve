(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "cout", "cross-spawn", "fs", "glob-watcher", "string_decoder", "uuid", "run-spout"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const cout = require("cout");
    const spawn = require("cross-spawn");
    const fs = require("fs");
    const watch = require("glob-watcher");
    const string_decoder_1 = require("string_decoder");
    const uuid_1 = require("uuid");
    const run_spout_1 = require("run-spout");
    const runner = new run_spout_1.RunSpout();
    runner.run();
    class WatchTask {
        constructor(web) {
            this.web = web;
            this.tasks = {};
        }
        processCommand(cmd, path, stats) {
            let taskCmd = cmd;
            const id = uuid_1.v4();
            const pathStat = (stats ? stats : fs.lstatSync(path));
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
            const taskQueue = this.tasks;
            runner.makeNewTask(taskCmd, 1000, () => {
                const task = spawn(`${taskCmd}`);
                const decoder = new string_decoder_1.StringDecoder("utf8");
                cout(`Executing "${taskCmd}"`).verbose();
                task.stdout.on("data", (data) => {
                    const strData = decoder.write(data);
                    const numLines = strData.split("\n").length;
                    // console.log("data", data.toString());
                    this.web.io.emit(`console`, {
                        type: "data",
                        cmd: taskCmd,
                        data: strData,
                        lines: numLines,
                        id,
                        timeStamp: (new Date()).toISOString(),
                    });
                });
                task.stderr.on("data", (data) => {
                    const strData = decoder.write(data);
                    const numLines = strData.split("\n").length;
                    cout("data", data.toString()).console.error();
                    this.web.io.emit(`console`, {
                        type: "error",
                        cmd: taskCmd,
                        data: strData,
                        lines: numLines,
                        id,
                        timeStamp: (new Date()).toISOString(),
                    });
                });
                task.on("close", (code) => {
                    this.web.io.emit(`console`, {
                        type: "close",
                        cmd: taskCmd,
                        code,
                        id,
                        timeStamp: (new Date()).toISOString(),
                    });
                    delete this.tasks[id];
                    cout(`Completed running "${taskCmd}"`).verbose();
                });
                taskQueue[id] = task;
            });
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
