(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const fs = require("fs");
    const path = require("path");
    /**
     * MockApi:
     * Class searches specified directories for scripts that add routes.
     */
    class MockEndpoint {
        constructor(server) {
            this.server = server;
        }
        addFile(sharePath, fileName) {
            const filePath = path.join(process.cwd(), fileName);
            fs.access(filePath, fs.constants.R_OK, (err) => {
                if (err)
                    return;
                const newScript = require(filePath);
                this.server.all(sharePath, newScript.run);
            });
        }
    }
    exports.MockEndpoint = MockEndpoint;
});
