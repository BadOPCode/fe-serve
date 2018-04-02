(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Config", "./WatchTasks", "./Web"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Config_1 = require("./Config");
    const WatchTasks_1 = require("./WatchTasks");
    const Web_1 = require("./Web");
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
});