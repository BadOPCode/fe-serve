(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Config", "./WatchTasks", "./Web", "cout"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Config_1 = require("./Config");
    const WatchTasks_1 = require("./WatchTasks");
    const Web_1 = require("./Web");
    const cout = require("cout");
    const bootstrap = () => {
        const config = new Config_1.Config();
        // need to add parameter to readPackage if specified.
        config.readPackage();
        const web = new Web_1.WebServer();
        const watch = new WatchTasks_1.WatchTask();
        web.processConfig(config);
        watch.processConfig(config);
        config.addListener((newConfig) => {
            web.processConfig(newConfig);
            watch.processConfig(newConfig);
        });
    };
    const hookLoop = (code) => {
        if (code === 0 || code === 42) {
            bootstrap();
        }
        else {
            cout(`Exiting with a code ${code}`).error();
        }
    };
    process.on('beforeExit', hookLoop);
    process.on('exit', hookLoop);
    process.on('SIGINT', (signal) => {
        cout(`closing server...`).error;
        process.exit(1);
    });
    process.on('uncaughtException', (err) => {
        cout(`Uncaught exception occurred: ${err}`).error();
    });
});
