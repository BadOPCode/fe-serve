(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "uuid", "./Tasks"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const uuid_1 = require("uuid");
    const Tasks_1 = require("./Tasks");
    /**
     * Creates a class for managing tasks and run there run characteristics.
     * @class TaskManager
     */
    class TaskManager {
        constructor() {
            this._taskDefinitionList = {};
            this._tasksLoaded = {};
        }
        /**
         * Stores a new task definition based off of a unique label.
         * If label exists it will overwrite the definition.
         * @method putTaskDefinition
         * @param taskDefinition ITaskConfig
         */
        putTaskDefinition(taskDefinition) {
            this._taskDefinitionList[taskDefinition.label] = taskDefinition;
        }
        /**
         * Removes a definition from the list of definitions.
         * @method removeTaskDefinition
         * @param label string
         */
        removeTaskDefinition(label) {
            delete this._taskDefinitionList[label];
        }
        /**
         * Returns a list of process ID's that the processes match the label.
         * @method getProcessIdList
         * @param label RegExp
         */
        getProcessIdList(label = /.*/) {
            const retList = [];
            const pidList = Object.keys(this._tasksLoaded);
            pidList.forEach((pid) => {
                const task = this._tasksLoaded[pid];
                if (task.config.label.match(label)) {
                    retList.push(pid);
                }
            });
            return retList;
        }
        cleanTasks() {
            const pidList = Object.keys(this._tasksLoaded);
            pidList.forEach((pid) => {
                const task = this._tasksLoaded[pid];
                if (task.isStopped) {
                    delete this._tasksLoaded[pid];
                }
            });
        }
        /**
         * Tries to start a new process running based off of the matching definition label.
         * This will run through definition rules.
         * - If there is no matching task definition we quit.
         * - singleInstanceOnly: If state is initialized or running than we do not start another process.
         * - funnelWarmupTime: If state is initialized we want to delete the old task and start a new one.
         * If state is running and is not singleInstanceOnly than we want to start a new task.
         * @param label string
         */
        create(label) {
            // clean out stopped tasks
            this.cleanTasks();
            if (!this._taskDefinitionList[label]) {
                // task is not defined, so just quit.
                return;
            }
            const taskDef = Object.assign({}, this._taskDefinitionList[label]);
            // search for an already existing process
            const pidList = this.getProcessIdList(new RegExp(`^${label}$`));
            if (pidList.length > 0) {
                // an existing task is found.
                if (taskDef.singleInstanceOnly) {
                    // task is a single instance only
                    if (taskDef.funnelWarmUpTime === 0) {
                        // there is no warmup timer defined so task must be running.
                        // we need to just stop and not run another task.
                        return;
                    }
                    // look for tasks that are running.
                    let foundRunningPid = false;
                    pidList.forEach((pidTask) => {
                        const task = this._tasksLoaded[pidTask];
                        if (task.isRunning) {
                            foundRunningPid = true;
                        }
                    });
                    if (foundRunningPid) {
                        // we found a task running so lets abort
                        return;
                    }
                    // else, no tasks are running fall through and check warmup state.
                }
                if (taskDef.funnelWarmUpTime > 0) {
                    // task is defined with a warm up timer
                    pidList.forEach((pidTask) => {
                        if (!this._tasksLoaded[pidTask].isInitialized) {
                            // if this task is initialized state, than remove it and let a new one be created.
                            // if task is running and we have already tested singleInstanceOnly than we just want to create
                            // a new one.
                            this._tasksLoaded[pidTask].destroy();
                            delete this._tasksLoaded[pidTask];
                        }
                    });
                }
            }
            // create a new task
            const pid = uuid_1.v4();
            this._tasksLoaded[pid] = new Tasks_1.Task(taskDef);
            this._tasksLoaded[pid].processID = pid;
            return this._tasksLoaded[pid];
        }
        runProcess(pid) {
            if (this._tasksLoaded[pid]) {
                this._tasksLoaded[pid].execute();
            }
        }
        run(label) {
            this.cleanTasks();
            const pidList = this.getProcessIdList();
            pidList.forEach((pid) => {
                if (this._tasksLoaded[pid] &&
                    this._tasksLoaded[pid].isInitialized) {
                    this.runProcess(pid);
                }
            });
        }
    }
    exports.TaskManager = TaskManager;
});
