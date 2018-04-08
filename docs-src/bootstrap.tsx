import * as React from "react";
import * as ReactDOM from "react-dom";
import { Page } from "./Page";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { BrowserRouter } from "react-router-dom";

const BootStrap = () => {
    return (
        <BrowserRouter>
            <MuiThemeProvider>
                <Page />
            </MuiThemeProvider>
        </BrowserRouter>    
    )
}

document.addEventListener("DOMContentLoaded", (event) => {
    const elem = document.getElementsByTagName("fullstackdocs");
    ReactDOM.render(
        <BootStrap />,
        elem[0]
    );
})
