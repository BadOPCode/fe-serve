import { Avatar, Badge, Chip, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary } from "@material-ui/core";
import * as React from "react";
import { XTerm } from "./XTerm";

import ErrorIcon from "@material-ui/icons/Error";
import NotesIcon from "@material-ui/icons/Notes";

interface IRefs {
    [k: string]: any;
    xterm: XTerm;
}

interface ITaskPanelProps {
    cmd: string;
    id: string;
}

interface ITaskPanelState {
    logLines: number;
    errLines: number;
}

export class TaskPanel extends React.Component<ITaskPanelProps, ITaskPanelState> {
    public refs: IRefs;
    public styles: { [key: string]: any }  = {
        cmdLabel: {
            fontSize: "24px",
        },
        summary: {
            display: "inline-flex",
            justifyContent: "space-between",
            width: "95%",
        },
    };

    constructor(public props: ITaskPanelProps, public state: ITaskPanelState) {
        super(props, state);
        this.state = {
            errLines: 0,
            logLines: 0,
        };
    }

    public componentDidMount() {
        this.attachListener(this.refs.xterm);
    }

    public componentWillUnmount() {
        this.refs.mainDeviceComponent.componentWillUnmount();
    }

    public attachListener(xterm: XTerm) {
        window.addEventListener(`console:${this.props.id}`, (evt: any) => {
            const pkt = evt.detail;
            if (pkt.lines) {
                if (pkt.type === "data") {
                    this.setState({
                        errLines: this.state.errLines,
                        logLines: this.state.logLines + pkt.lines,
                    });
                }
                if (pkt.type === "error") {
                    this.setState({
                        errLines: this.state.errLines + pkt.lines,
                        logLines: this.state.logLines,
                    });
                }
            }

            if (pkt.data) {
                const dataLines = pkt.data.split("\n");
                dataLines.forEach((data: any, index: number) => {
                    if (index === dataLines.length - 1) {
                        xterm.write(data);
                    } else {
                        xterm.writeln(data);
                    }
                });
            }
        });
    }

    public render() {
        return (
            <React.Fragment>
                <ExpansionPanel>
                    <ExpansionPanelSummary style={ this.styles.summary }>
                        <div style={this.styles.summary}>
                            <span style={ this.styles.cmdLabel } >{ this.props.cmd }</span>
                            <div>
                                <Chip
                                    avatar={
                                        <Avatar><NotesIcon /></Avatar>
                                    }
                                    label={ this.state.logLines }
                                    color="primary"
                                />
                                <Chip
                                    avatar={
                                        <Avatar><ErrorIcon /></Avatar>
                                    }
                                    label={ this.state.errLines }
                                    color="secondary"
                                />
                            </div>
                        </div>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <XTerm
                            ref="xterm"
                            addons = {["fit", "fullscreen", "search"]}
                            style={{
                                height: "100%",
                                overflow: "hidden",
                                position: "relative",
                                width: "100%",
                            }}
                        />
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </React.Fragment>
        );
    }
}
