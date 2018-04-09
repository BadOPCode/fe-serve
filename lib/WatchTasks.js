(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "glob-watcher", "shelljs", "cout"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const fs = require("fs");
    const watch = require("glob-watcher");
    const shell = require("shelljs");
    const cout = require("cout");
    class WatchTask {
        processCommand(cmd, path, stats) {
            let taskCmd = cmd;
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
            shell.exec(taskCmd);
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
