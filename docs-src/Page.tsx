import * as React from "react";
import { AppBar, Drawer, List, ListItem, Subheader } from "material-ui";
import { Route, Link, Switch } from "react-router-dom";

import "./global.scss";
import { Home } from "./Home";
import { About } from "./About";
import { Install } from "./Install";
import { WhatsNext } from "./WhatsNext";

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
                        <Link to="/Home">
                            <ListItem>
                                Home
                            </ListItem>
                        </Link>
                        <Link to="/About">
                            <ListItem>
                                About
                            </ListItem>
                        </Link>
                        <ListItem
                            initiallyOpen={true}
                            nestedItems={[
                                <Link to="/Install">
                                    <ListItem>
                                        Installing Fullstack
                                    </ListItem>
                                </Link>,
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
                        <Link to="/WhatsNext">
                            <ListItem>
                                What's Next
                            </ListItem>
                        </Link>
                    </List>
                </Drawer>
                <div className={ "content" }>
                    <Switch>
                        <Route path="/Home" component={ Home } />
                        <Route path="/About" component={ About } />
                        <Route path="/Install" component={ Install } />
                        <Route path="/WhatsNext" component={ WhatsNext } />
                        <Route component={ Home } />
                    </Switch>
                </div>
            </div>
        );
    }
}