import * as React from "react";
import { List, ListItem } from "@material-ui/core";

interface ITabOverviewProps {}
interface ITabOverviewState {}

export class TabOverview extends React.Component<ITabOverviewProps, ITabOverviewState> {
    serverMessages: string[] = [];

    constructor(public props: ITabOverviewProps, public state: ITabOverviewState) {
        super(props, state);
    }

    public serverNotifications() {
        if (this.serverMessages.length === 0) {
            return (<ListItem>No notifications</ListItem>);
        }
        return this.serverMessages.map((message:string) => {
            return (<ListItem>{ message }</ListItem>)
        });
    }

    public render() {
        return (
            <React.Fragment>
                <div>Server Notifications</div>
                <List>
                    { this.serverNotifications() }
                </List>

            </React.Fragment>
        );
    }
}