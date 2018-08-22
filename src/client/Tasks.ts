import { updateTask } from "./Actions";
import { store } from "./Shared";

export interface ITask {
    cmd: string;
    id: string;
    timeStamp: Date;
}

export interface ITaskPacket extends ITask {
    type: string;
    data?: string;
    code?: number;
}

export interface ITaskStatus extends ITask{
    state: string;
}

export interface ITaskStore {
    dashboardOpen: boolean;
    tabSelected: number;
    tasks: { [id: string]: ITaskStatus };
}

export type ITaskList = { [id: string]: ITaskStatus };

export class TaskProcessor {

    process(pkt: ITaskPacket) {
        const storeState = store.getState();
        const currentTasks = storeState.tasks;
        
        const incomingTask: ITaskStatus = {
            cmd: pkt.cmd,
            id: pkt.id,
            state: "",
            timeStamp: pkt.timeStamp
        };

        if (!Object(currentTasks).hasOwnProperty(pkt.id)) {
            incomingTask.state = "started";
        } else {
            incomingTask.state = "running";
        }

        if (pkt.code !== undefined) {
            incomingTask.state = "closed";
        }

        console.log("pkt:", pkt);
        
        store.dispatch(updateTask(incomingTask));
    }
}