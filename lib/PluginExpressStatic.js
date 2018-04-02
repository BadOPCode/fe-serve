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
    /**
     * PluginExpressReload.ts: Plugin for Express 4.x that will inject a JS in
     * the body of a HTML and than reload the page on a change.
     * Based off of express-dev-reload by Moritz(mo22)
     */
    // import * as expressModifyResponse from "express-modify-response";
    const fs = require("fs");
    const path = require("path");
    function Static(options) {
        // console.log("Plugin loaded", options.webServer);
        const pluginExpressStatic = (req, res, next) => {
            if (!req.path.match(/\/$/)) {
                const match = RegExp(options.serverRoute + "(.*)$");
                const pathLocation = req.path.match(match);
                const fileLocation = path.join(options.localPath, pathLocation[1]);
                fs.access(fileLocation, fs.constants.R_OK, (err) => {
                    if (err) {
                        next();
                        return;
                    }
                    const fileStream = fs.createReadStream(fileLocation);
                    const bodyPattern = /<\/\s*?body\s?.*>/gi;
                    fileStream.on("data", (chunk) => {
                        let strChunk = chunk.toString("utf8");
                        if (strChunk.match(bodyPattern)) {
                            strChunk = strChunk.replace(bodyPattern, options.injectedText + "$&");
                            res.write(strChunk);
                        }
                        else {
                            res.write(chunk);
                        }
                    });
                    fileStream.on("end", () => {
                        res.end();
                        next();
                    });
                });
            }
            else {
                next();
            }
        };
        return pluginExpressStatic;
    }
    exports.default = Static;
});