(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "cout", "./Config", "./WatchTasks", "./Web"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const cout = require("cout");
    const Config_1 = require("./Config");
    const WatchTasks_1 = require("./WatchTasks");
    const Web_1 = require("./Web");
    const bootstrap = () => {
        const config = new Config_1.Config();
        // need to add parameter to readPackage if specified.
        config.readPackage();
        const web = new Web_1.WebServer();
        const watch = new WatchTasks_1.WatchTask(web);
        config.addListener((eventType) => {
            if (eventType === "loaded") {
                web.processConfig(config);
                watch.processConfig(config);
            }
            if (eventType === "reload") {
                web.writeToQueue("browser command", "reload");
                process.exit(42);
            }
        });
        process.on("uncaughtException", (err) => {
            cout(`Uncaught exception occurred: ${err}`).error();
            web.writeToQueue("events", err);
        });
    };
    process.on("SIGINT", (signal) => {
        cout(`closing server...`).error;
        process.exit(1);
    });
    bootstrap();
});
