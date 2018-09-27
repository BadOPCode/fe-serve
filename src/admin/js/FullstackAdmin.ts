import * as React from "react";
import * as ReactDom from "react-dom";
import { Dashboard } from "./Dashboard";
import * as reload from "./Reload";
import { socket } from "./Shared";

// declare var document: Document;

reload.run(socket);

const elem = document.getElementsByTagName("FullstackDashboard")[0];
const comp = ReactDom.render(
    React.createElement(Dashboard),
    elem,
);
