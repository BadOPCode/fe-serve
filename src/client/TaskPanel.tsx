import * as React from "react";
import { XTerm } from "./XTerm";
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from "@material-ui/core";

interface IRefs {
    [k: string]: any
    xterm: XTerm;
}

interface ITaskPanelProps {
    cmd: string;
    id: string;
}

interface ITaskPanelState {}

export class TaskPanel extends React.Component<ITaskPanelProps, ITaskPanelState> {

    constructor(public props: ITaskPanelProps, public state: ITaskPanelState) {
        super(props, state);
    }

    render() {
        return (
            <React.Fragment>
                <ExpansionPanel>
                    <ExpansionPanelSummary>
                        { this.props.cmd }
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <XTerm 
                            ref='xterm' 
                            addons = {['fit', 'fullscreen', 'search']}
                            style={{
                                overflow: 'hidden',
                                position: 'relative',
                                width: '100%',
                                height: '100%'
                            }}
                        />
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </React.Fragment>
        );
    }
}