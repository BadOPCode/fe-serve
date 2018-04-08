import * as shell from "shelljs";
import {Clean} from "./clean";

export function BuildClient() {
    // shell.exec("tsc -p tsconfig.client.json");
    shell.exec("webpack");
}

export function BuildServer() {
    shell.exec("tsc -p tsconfig.server.json");
}

export function BuildTests() {
    shell.exec("tsc -p tsconfig.test.json");
}

export function BuildDocs() {
    shell.exec("webpack --config webpack.docs.config.js");
}

export function BuildDev() {
    Clean();
    BuildServer();
    BuildClient();
}

export function Deploy() {
    Clean();
    BuildServer();
    BuildClient();
    BuildTests();    
}