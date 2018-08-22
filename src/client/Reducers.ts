import { TAB_SELECTED, TOGGLE_DASHBOARD, UPDATE_TASK } from "./Actions";
import INITIAL_STATE from "./InitialState";
import { ITaskStore, ITask, ITaskStatus } from "./Tasks";
import { Action, handleActions, ReducerMap, ReducerMapValue, ReducerMapMeta } from "redux-actions";

const reducerMap:ReducerMapMeta<ITaskStore, any, {}> = {
    [TAB_SELECTED]: (state: ITaskStore, action: Action<number>): ITaskStore => {
        state.tabSelected = <number>action.payload;
        return state;
    },
    
    [TOGGLE_DASHBOARD]: (state: ITaskStore): ITaskStore => {
        state.dashboardOpen = !state.dashboardOpen;

        return state;
    },

    [UPDATE_TASK]: (state: ITaskStore, action: Action<ITaskStatus>): ITaskStore => {
        const updateTask = action.payload;
        state.tasks[updateTask.id] = updateTask;

        return state;
    },

};

const reduced =  handleActions(reducerMap, INITIAL_STATE);
export default reduced;
