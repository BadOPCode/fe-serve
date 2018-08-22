import reducerMap from "./Reducers";
import { ITaskStore, TaskProcessor } from "./Tasks";
import { Store, createStore } from "redux";

declare var io: any;

export const store: Store<ITaskStore> = createStore(reducerMap);

export const socket = io.connect();

export const taskMgr: TaskProcessor = new TaskProcessor()