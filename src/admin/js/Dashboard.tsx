import { AppBar, Drawer, Tab, Tabs } from "@material-ui/core";
import * as React from "react";

import { dashboardToggle, tabSelected } from "./Actions";
import { store } from "./Shared";
import { TabOverview } from "./TabOverview";
import { TabTasks } from "./TabTasks";
import { ITask, ITaskStore } from "./Tasks";

import "xterm/dist/xterm.css";

interface IDashboardProps extends ITaskStore {}
interface IDashboardState extends ITaskStore {}

export class Dashboard extends React.Component<IDashboardProps, IDashboardState> {
    constructor(public props: IDashboardProps, public state: IDashboardState) {
        super(props, state);

        this.toggleDasboard = this.toggleDasboard.bind(this);
        this.mapStoreToState = this.mapStoreToState.bind(this);
    }

    public mapStoreToState() {
        this.setState(store.getState());
    }

    public toggleDasboard() {
        store.dispatch(dashboardToggle());
    }

    public handleChangeTab(event: React.ChangeEvent<{}>, value: any) {
        store.dispatch(tabSelected(value));
    }

    public renderTabs() {
        return [
            <Tab label={ "Overview" } key={ "tab0" } />,
            <Tab label={ "Tasks" } key={ "tab1" } />,
        ];
    }

    public componentDidMount() {
        store.subscribe(this.mapStoreToState);
    }

    public render() {
        return(
            <React.Fragment>
                <AppBar position="static" color="default">
                    <Tabs
                        value={ this.state.tabSelected }
                        onChange={ this.handleChangeTab }
                        indicatorColor="primary"
                        textColor="primary"
                        scrollable
                        scrollButtons="auto"
                    >
                        { this.renderTabs() }
                    </Tabs>
                </AppBar>
                { this.state.tabSelected === 0 && <TabOverview /> }
                { this.state.tabSelected === 1 && <TabTasks tasks={ this.state.tasks } /> }
            </React.Fragment>
        );
    }
}
