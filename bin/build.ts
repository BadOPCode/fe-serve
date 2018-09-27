import * as path from "path";
import * as shell from "shelljs";
import {Clean} from "./clean";

export function BuildClient() {
    // shell.exec("tsc -p tsconfig.client.json");
    shell.pushd("src/client");
    shell.exec("webpack");
    shell.popd();
}

export function BuildAdmin() {
    shell.pushd("src/admin");
    shell.exec("webpack");
    shell.cp("-r", "html", path.join(__dirname, "..", "lib", "admin"));
    shell.popd();
}

export function BuildServer() {
    shell.pushd("src/server");
    shell.exec("tsc -p tsconfig.server.json");
    shell.popd();
}

export function BuildTests() {
    shell.exec("tsc -p tsconfig.test.json");
}

export function BuildDocs() {
    shell.pushd("src/docs");
    shell.exec("webpack");
    shell.popd();
}

export function BuildDev() {
    Clean();
    BuildServer();
    BuildClient();
    BuildAdmin();
}

export function Deploy() {
    Clean();
    BuildServer();
    BuildClient();
    BuildTests();
}
