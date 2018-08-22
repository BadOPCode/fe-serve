import { createAction } from "redux-actions";

import { ITask, ITaskStatus } from "./Tasks";

// mnemonics
export const TAB_SELECTED = "TAB_SELECTED";
export const TOGGLE_DASHBOARD = "TOGGLE_DASHBOARD";
export const UPDATE_TASK = "UPDATE TASK";

export const tabSelected = createAction(
    TAB_SELECTED,
    (tabValue: number) => {
        return tabValue;
    }
);

export const dashboardToggle = createAction(
    TOGGLE_DASHBOARD,
)

export const updateTask = createAction(
    UPDATE_TASK,
    (updateTask: ITaskStatus) => {
        return updateTask;
    }
)
