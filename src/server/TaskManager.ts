import { ITask } from "run-spout";
import { v4 } from "uuid";
import { ITaskConfig, Task } from "./Tasks";

/**
 * Creates a class for managing tasks and run there run characteristics.
 * @class TaskManager
 */
export class TaskManager {
    private _taskDefinitionList: { [label: string]: ITaskConfig } = {};
    private _tasksLoaded: { [pid: string]: Task } = {};

    /**
     * Stores a new task definition based off of a unique label.
     * If label exists it will overwrite the definition.
     * @method putTaskDefinition
     * @param taskDefinition ITaskConfig
     */
    public putTaskDefinition(taskDefinition: ITaskConfig) {
        this._taskDefinitionList[taskDefinition.label] = taskDefinition;
    }

    /**
     * Removes a definition from the list of definitions.
     * @method removeTaskDefinition
     * @param label string
     */
    public removeTaskDefinition(label: string) {
        delete this._taskDefinitionList[label];
    }

    /**
     * Returns a list of process ID's that the processes match the label.
     * @method getProcessIdList
     * @param label RegExp
     */
    public getProcessIdList(label: RegExp = /.*/ ) {
        const retList: string[] = [];
        const pidList = Object.keys(this._tasksLoaded);
        pidList.forEach((pid) => {
            const task = this._tasksLoaded[pid];
            if (task.config.label.match(label)) {
                retList.push(pid);
            }
        });

        return retList;
    }

    public cleanTasks() {
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
    public create(label: string): Task {
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
                let foundRunningPid: boolean = false;
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
        const pid = v4();
        this._tasksLoaded[pid] = new Task(taskDef);
        this._tasksLoaded[pid].processID = pid;
        return this._tasksLoaded[pid];
    }

    public runProcess(pid: string) {
        if (this._tasksLoaded[pid]) {
            this._tasksLoaded[pid].execute();
        }
    }

    public run(label: string) {
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
