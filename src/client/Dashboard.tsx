import { AppBar, Drawer, Tab, Tabs } from "@material-ui/core";
import * as React from "react";
import { Store, createStore } from "redux";

import { dashboardToggle, tabSelected } from "./Actions";
import { ITask, ITaskStore } from "./Tasks";
import { store } from "./Shared";
import { TabOverview } from "./TabOverview";
import { TabTasks } from "./TabTasks";

import "xterm/dist/xterm.css";

interface IDashboardProps extends ITaskStore {}
interface IDashboardState extends ITaskStore {}

export class Dashboard extends React.Component<IDashboardProps, IDashboardState> {
    constructor(public props: IDashboardProps, public state: IDashboardState) {
        super(props, state);

        this.toggleDasboard = this.toggleDasboard.bind(this);
        this.mapStoreToState = this.mapStoreToState.bind(this);

        document.addEventListener("keypress", (evt) => {
            if (evt.key === "~") {
                this.toggleDasboard();
            }
        });
    }

    mapStoreToState() {
        this.setState(store.getState());
    }

    public toggleDasboard() {
        store.dispatch(dashboardToggle());
    }

    public handleChangeTab(event: React.ChangeEvent<{}>, value: any) {
        console.log("value", value);
        store.dispatch(tabSelected(value));
    }

    public renderTabs() {
        return [
            <Tab label={ "Overview" } key={ "tab0" } />,
            <Tab label={ "Tasks" } key={ "tab1" } />
        ];
    }

    componentDidMount() {
        store.subscribe(this.mapStoreToState);
    }

    public render() {
        return(
            <React.Fragment>
                <Drawer
                    anchor="top"
                    open={ this.state.dashboardOpen }
                >
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
                </Drawer>
            </React.Fragment>
        );
    }
}
