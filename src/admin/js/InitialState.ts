import { ITaskStore } from "./Tasks";

export const INITIAL_STATE: ITaskStore = {
    dashboardOpen: false,
    tabSelected: 0,
    tasks: {},
};

export default INITIAL_STATE;
