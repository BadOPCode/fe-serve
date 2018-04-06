(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "glob-watcher", "shelljs", "cout"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const watch = require("glob-watcher");
    const shell = require("shelljs");
    const cout = require("cout");
    class WatchTask {
        processCommand(cmd, path, stats) {
            let taskCmd = cmd;
            let fileType;
            if (stats.isBlockDevice()) {
                fileType = "block";
            }
            if (stats.isCharacterDevice()) {
                fileType = "char";
            }
            if (stats.isDirectory()) {
                fileType = "dir";
            }
            if (stats.isFIFO()) {
                fileType = "fifo";
            }
            if (stats.isFile()) {
                fileType = "file";
            }
            if (stats.isSocket()) {
                fileType = "socket";
            }
            if (stats.isSymbolicLink()) {
                fileType = "link";
            }
            taskCmd = taskCmd.replace(/{file}/g, path)
                .replace(/{type}/g, fileType)
                .replace(/{mode}/g, "" + stats.mode)
                .replace(/{size}/g, "" + stats.size)
                .replace(/{atime}/g, "" + stats.atimeMs)
                .replace(/{mtime}/g, "" + stats.mtimeMs)
                .replace(/{ctime}/g, "" + stats.ctimeMs)
                .replace(/{btime}/g, "" + stats.birthtimeMs);
            cout(`Task triggered running: ${cmd}`).warn();
            shell.exec(taskCmd);
        }
        processConfig(config) {
            this.pvtConfig = config;
            this.queue = [];
            if (!!this.pvtConfig.watchTasks) {
                this.pvtConfig.watchTasks.forEach((task) => {
                    const newWatch = watch(task.masks);
                    cout(`Watching path ${task.masks}`).warn();
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
