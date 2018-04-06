import * as shell from "shelljs";
import * as path from "path";

const bootstrap = path.join(__dirname, "main");
let code: number = 0;

while (code === 0 || code === 42) {
    code = shell.exec(`node ${bootstrap}`).code;
}