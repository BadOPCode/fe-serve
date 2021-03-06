import * as React from "react";
import { AppBar, Drawer, List, ListItem, Subheader } from "material-ui";
import { Route, Link, Switch } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

import "./global.scss";
import { Home } from "./Home";
import { About } from "./About";
import { Install } from "./Install";
import { WhatsNext } from "./WhatsNext";
import { Config } from "./Config";

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
                    title={
                        <div className={ "banner-title" }>
                            Fullstack Serve <img src={ "Swiss_Army_Knife.svg" } />
                        </div>                            
                    }
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
                        <ListItem
                            containerElement={<Link to="/Home"/>}>
                            Home
                        </ListItem>
                        <ListItem
                            containerElement={<Link to="/About"/>}>
                            About
                        </ListItem>
                        <ListItem
                            initiallyOpen={true}
                            nestedItems={[
                                <ListItem
                                    containerElement={<Link to="/Install"/>}>
                                    Installing Fullstack
                                </ListItem>,
                                <ListItem
                                    containerElement={<Link to="/Config"/>}
                                    initiallyOpen={true}
                                    nestedItems={[
                                        <ListItem
                                            containerElement={<HashLink to="#Mock" />}>
                                            Mock Path Maps
                                        </ListItem>,
                                        <ListItem
                                        containerElement={<HashLink to="#Proxy" />}>
                                            Proxy Path Maps
                                        </ListItem>,
                                        <ListItem
                                            containerElement={<HashLink to="#Static" />}>
                                            Static Path Maps
                                        </ListItem>,
                                        <ListItem
                                            containerElement={<HashLink to="#Watch" />}>
                                            Watch Tasks
                                        </ListItem>
                                    ]}
                                >
                                    Configuring Fullstack
                                </ListItem>
                            ]}>
                            Docs
                        </ListItem>
                        <ListItem
                            containerElement={<Link to="/Install"/>}>
                            What's Next
                        </ListItem>
                    </List>
                </Drawer>
                <div className={ "content" }>
                    <Switch>
                        <Route path="/Home" component={ Home } />
                        <Route path="/About" component={ About } />
                        <Route path="/Install" component={ Install } />
                        <Route path="/Config" component={ Config } />
                        <Route path="/WhatsNext" component={ WhatsNext } />
                        <Route component={ Home } />
                    </Switch>
                </div>
            </div>
        );
    }
}