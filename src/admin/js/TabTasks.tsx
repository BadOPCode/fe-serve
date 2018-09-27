import * as React from "react";
import { ITask, ITaskList } from "./Tasks";
import { TaskPanel } from "./TaskPanel";

interface ITabTasksProps {
    tasks: ITaskList;
}
interface ITabTasksState {}

export class TabTasks extends React.Component<ITabTasksProps, ITabTasksState> {
    renderPanels() {
        const keys = Object.keys(this.props.tasks);
        return keys.map((key: string) => {
            const task = this.props.tasks[key];
            return (<TaskPanel cmd={ task.cmd } id={ task.id } />);
        });
    }

    render() {
        return (
            <React.Fragment>
                { this.renderPanels() }
            </React.Fragment>
        );
    }
}