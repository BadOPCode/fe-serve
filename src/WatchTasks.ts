import * as decision from "dt-decisions";
import * as watch from "glob-watcher";
import * as shell from "shelljs";
import { IConfigData } from "./Config";

export class WatchTask {
    public queue: any[];
    private pvtConfig: IConfigData;

    public processCommand(cmd: string, path: string, stats: any) {
        const taskCmd: string = cmd;

        let fileType: string;
        if (stats.isBlockDevice()) { fileType = "block"; }
        if (stats.isCharacterDevice()) { fileType = "char"; }
        if (stats.isDirectory()) { fileType = "dir"; }
        if (stats.isFIFO()) { fileType = "fifo"; }
        if (stats.isFile()) { fileType = "file"; }
        if (stats.isSocket()) { fileType = "socket"; }
        if (stats.isSymbolicLink()) { fileType = "link"; }

        taskCmd.replace("{file}", path);
        taskCmd.replace("{type}", fileType);
        taskCmd.replace("{mode}", stats.mode);
        taskCmd.replace("{size}", stats.size);
        taskCmd.replace("{atime}", stats.atimeMs);
        taskCmd.replace("{mtime}", stats.mtimeMs);
        taskCmd.replace("{ctime}", stats.ctimeMs);
        taskCmd.replace("{btime}", stats.birthtimeMs);

        shell.exec(taskCmd);
    }

    public processConfig(config: IConfigData) {
        this.pvtConfig = config;
        this.queue = [];

        if (!!this.pvtConfig.watchTasks) {
            this.pvtConfig.watchTasks.forEach((task) => {
                const newWatch = watch(task.masks);
                newWatch.on("add", (path: string, stat: any) =>
                    this.processCommand(task.tasks.onAdd, path, stat));
                newWatch.on("change", (path: string, stat: any) =>
                    this.processCommand(task.tasks.onChange, path, stat));
                newWatch.on("unlink", (path: string, stat: any) =>
                    this.processCommand(task.tasks.onDelete, path, stat));
                this.queue.push(newWatch);
            });
        }
    }
}
