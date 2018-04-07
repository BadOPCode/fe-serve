(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "shelljs", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const shell = require("shelljs");
    const path = require("path");
    const bootstrap = path.join(__dirname, "main");
    let code = 0;
    while (code === 0 || code === 42) {
        code = shell.exec(`node ${bootstrap}`).code;
    }
});
