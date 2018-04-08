import * as React from "react";
import { AppBar, Drawer, List, ListItem, Subheader } from "material-ui";
import { Route, Link, Switch } from "react-router-dom";

import "./global.scss";
import { Home } from "./Home";
import { About } from "./About";

interface IPageProps {}
interface IPageState {
    drawerIsOpen: boolean;
}

export class Page extends React.Component<IPageProps, IPageState> {
    constructor(public props:IPageProps, public state:IPageState) {
        super(props, state);

        this.state = {
            drawerIsOpen: false
        }
                
        this.handleClickBurger = this.handleClickBurger.bind(this);
        this.handleCloseDrawer = this.handleCloseDrawer.bind(this);
        this.handleToggleDrawer = this.handleToggleDrawer.bind(this);
    }

    handleClickBurger() {
        this.handleToggleDrawer();
    }

    handleToggleDrawer = () => this.setState({drawerIsOpen: !this.state.drawerIsOpen});

    handleCloseDrawer = () => this.setState({drawerIsOpen: false});

    render() {
        return (
            <div>
                <AppBar
                    title={"Fullstack Serve"}
                    onLeftIconButtonClick={ this.handleClickBurger }
                    zDepth={ 99 }
                />
                <Drawer
                    docked={false}
                    width={300}
                    open={this.state.drawerIsOpen}
                    onRequestChange={(drawerIsOpen) => this.setState({drawerIsOpen})}
                >
                    <List>
                        <Subheader>Topics</Subheader>
                        <Link to="/index.html/home">
                            <ListItem>
                                Home
                            </ListItem>
                        </Link>
                        <Link to="/index.html/about">
                            <ListItem>
                                About
                            </ListItem>
                        </Link>
                        <ListItem
                            initiallyOpen={true}
                            nestedItems={[
                                <ListItem>
                                    Installing Fullstack
                                </ListItem>,
                                <ListItem
                                    initiallyOpen={true}
                                    nestedItems={[
                                        <ListItem>
                                            Mock Path Maps
                                        </ListItem>,
                                        <ListItem>
                                            Proxy Path Maps
                                        </ListItem>,
                                        <ListItem>
                                            Static Path Maps
                                        </ListItem>,
                                        <ListItem>
                                            Watch Tasks
                                        </ListItem>
                                    ]}
                                >
                                    Configuring Fullstack
                                </ListItem>
                            ]}>
                            Docs
                        </ListItem>
                        <ListItem>
                            What's Next
                        </ListItem>
                    </List>
                </Drawer>
                <div>
                    <Switch>
                        <Route path="/index.html/Home" component={ Home } />
                        <Route path="/index.html/about" component={ About } />
                        <Route component={ Home } />
                    </Switch>
                </div>
            </div>
        );
    }
}