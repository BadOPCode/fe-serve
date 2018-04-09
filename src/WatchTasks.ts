import * as decision from "dt-decisions";
import * as fs from "fs";
import * as watch from "glob-watcher";
import * as shell from "shelljs";
import * as cout from "cout";

import { IConfigData } from "./Config";

export class WatchTask {
    public queue: any[];
    private pvtConfig: IConfigData;

    public processCommand(cmd: string, path: string, stats: any) {
        let taskCmd: string = cmd;
        const pathStat: any = ( stats ? stats : fs.lstatSync(path) )

        let fileType: string;
        if (pathStat.isBlockDevice()) { fileType = "block"; }
        if (pathStat.isCharacterDevice()) { fileType = "char"; }
        if (pathStat.isDirectory()) { fileType = "dir"; }
        if (pathStat.isFIFO()) { fileType = "fifo"; }
        if (pathStat.isFile()) { fileType = "file"; }
        if (pathStat.isSocket()) { fileType = "socket"; }
        if (pathStat.isSymbolicLink()) { fileType = "link"; }

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

    public processConfig(config: IConfigData) {
        this.pvtConfig = config;
        this.queue = [];

        if (!!this.pvtConfig.watchTasks) {
            this.pvtConfig.watchTasks.forEach((task) => {
                const newWatch = watch(task.masks);
                cout(`Watching path ${task.masks}`).verbose();

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
