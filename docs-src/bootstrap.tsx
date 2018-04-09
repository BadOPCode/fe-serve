import * as React from "react";
import * as ReactDOM from "react-dom";
import { Page } from "./Page";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { HashRouter } from "react-router-dom";

const BootStrap = () => {
    return (
        <HashRouter>
            <MuiThemeProvider>
                <Page />
            </MuiThemeProvider>
        </HashRouter>    
    )
}

document.addEventListener("DOMContentLoaded", (event) => {
    const elem = document.getElementsByTagName("fullstackdocs");
    ReactDOM.render(
        <BootStrap />,
        elem[0]
    );
})
