import * as cout from "cout";
import * as decision from "dt-decisions";
import * as fs from "fs";
import * as watch from "glob-watcher";
import * as shell from "shelljs";
import { StringDecoder } from "string_decoder";
import { v4 } from "uuid";

import { RunSpout } from "run-spout";
import { IConfigData } from "./Config";
import { TaskManager } from "./TaskManager";
import { ITaskConfig, Task } from "./Tasks";
import { WebServer } from "./Web";
import { WebAdminServer } from "./WebAdmin";

// const runner = new RunSpout();
// runner.run();

export class WatchTask {
    public queue: any[];
    // public tasks: any = {};
    public taskMgr: TaskManager;
    private pvtConfig: IConfigData;

    constructor(public web: WebAdminServer) {
        this.taskMgr = new TaskManager();
    }

    public processCommand(cmd: string, path: string, stats: any) {
        let taskCmd: string = cmd;
        const id: string = v4();
        const pathStat: any = ( stats ? stats : fs.lstatSync(path) );

        const taskOptions: ITaskConfig = {
            arguments: [],
            command: "",
            funnelWarmUpTime: 0,
            label: "",
            maxRunLength: 0,
            options: {},
            singleInstanceOnly: false,
        };

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

        if (taskCmd.charAt(1) === "!") {
            // if banged than use pre-defined task.
            // lets strip the bang off
            taskCmd = taskCmd.substr(1);
        } else {
            // taskCmd is not banged so lets generate a task definition
            this.taskMgr.putTaskDefinition({
                // default watch task
                arguments: [], // no arguments
                command: taskCmd,
                funnelWarmUpTime: 0, // no warmup time
                label: taskCmd, // command is label
                maxRunLength: 0, // no max runtime length
                options: {},
                singleInstanceOnly: true, // single instance
            });
        }

        const task = this.taskMgr.create(taskCmd);

        if (task) {
            task.onClose((code: number) => {
                this.web.io.emit(`console`, {
                    type: "close",

                    cmd: taskCmd,
                    code,
                    id,
                    timeStamp: (new Date()).toISOString(),
                });
                cout(`Completed running "${taskCmd}"`).verbose();
            });

            task.onData((output: string, numLines: number) => {
                this.web.io.emit(`console`, {
                    type: "data",

                    cmd: taskCmd,
                    data: output,
                    id,
                    lines: numLines,
                    timeStamp: (new Date()).toISOString(),
                });
            });

            task.onError((output: string, numLines: number) => {
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
        } else {
            cout(`Trigger "${taskCmd}" ignored`);
        }
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
