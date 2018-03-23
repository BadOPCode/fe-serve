(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Config", "./Web"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Config_1 = require("./Config");
    const Web_1 = require("./Web");
    const config = new Config_1.Config();
    // need to add parameter to readPackage if specified.
    config.readPackage();
    const web = new Web_1.WebServer();
    web.processConfig(config);
    config.addListener((newConfig) => {
        web.processConfig(newConfig);
    });
});
