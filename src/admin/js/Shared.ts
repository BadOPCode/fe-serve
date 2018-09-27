import { createStore, Store } from "redux";
import reducerMap from "./Reducers";
import { ITaskStore, TaskProcessor } from "./Tasks";

declare var io: any;

export const store: Store<ITaskStore> = createStore(reducerMap);

export const socket = io.connect();

export const taskMgr: TaskProcessor = new TaskProcessor();
