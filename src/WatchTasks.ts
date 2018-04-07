import * as decision from "dt-decisions";
import * as watch from "glob-watcher";
import * as shell from "shelljs";
import * as cout from "cout";

import { IConfigData } from "./Config";

export class WatchTask {
    public queue: any[];
    private pvtConfig: IConfigData;

    public processCommand(cmd: string, path: string, stats: any) {
        let taskCmd: string = cmd;

        let fileType: string;
        if (stats.isBlockDevice()) { fileType = "block"; }
        if (stats.isCharacterDevice()) { fileType = "char"; }
        if (stats.isDirectory()) { fileType = "dir"; }
        if (stats.isFIFO()) { fileType = "fifo"; }
        if (stats.isFile()) { fileType = "file"; }
        if (stats.isSocket()) { fileType = "socket"; }
        if (stats.isSymbolicLink()) { fileType = "link"; }

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

    public processConfig(config: IConfigData) {
        this.pvtConfig = config;
        this.queue = [];

        if (!!this.pvtConfig.watchTasks) {
            this.pvtConfig.watchTasks.forEach((task) => {
                const newWatch = watch(task.masks);
                cout(`Watching path ${task.masks}`).warn();

                if (task.tasks.any) {
                    newWatch.on("add", (path: string, stat: any) =>
                        this.processCommand(task.tasks.any, path, stat));
                    newWatch.on("change", (path: string, stat: any) =>
                        this.processCommand(task.tasks.any, path, stat));
                    newWatch.on("unlink", (path: string, stat: any) =>
                        this.processCommand(task.tasks.any, path, stat));
                }
                if (task.tasks.onAdd) {
                    newWatch.on("add", (path: string, stat: any) =>
                        this.processCommand(task.tasks.onAdd, path, stat));
                }
                if (task.tasks.onChange) {
                    newWatch.on("change", (path: string, stat: any) =>
                        this.processCommand(task.tasks.onChange, path, stat));
                }
                if (task.tasks.onDelete) {
                    newWatch.on("unlink", (path: string, stat: any) =>
                        this.processCommand(task.tasks.onDelete, path, stat));
                }
                this.queue.push(newWatch);
            });
        }
    }
}
