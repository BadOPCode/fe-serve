(function(factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    } else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "path", "cout"], factory);
    }
})(function(require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Config.ts
     * Handles processing configurations
     * @license MIT
     */
    const fs = require("fs");
    const path = require("path");
    const cout = require("cout");
    /**
     * Module that holds token constants
     */
    exports.Symbols = {
        MISSING_CONFIG: "The package.json does not contain fullstack-serve information.",
        MISSING_LOCALPATH: "The localPath in static mapping was not specified",
        READ_ERROR: "Cannot find specified package.json.",
    };
    class Config {
        constructor() {
            this.listeners = [];
        }
        addListener(newListener) {
            this.listeners.push(newListener);
        }
        notifyListeners() {
                this.listeners.forEach((listener) => {
                    listener(this);
                });
            }
            /**
             * readPackage()
             * reads a package.json for the fe serve info
             */
        readPackage(specifiedPath = ".") {
            const packagePath = path.join(specifiedPath, "package.json");
            fs.access(packagePath, fs.constants.R_OK, (err) => {
                if (err) {
                    cout(exports.Symbols.READ_ERROR).error();
                    throw new Error(exports.Symbols.READ_ERROR);
                }
                const packageInfo = JSON.parse(fs.readFileSync(packagePath, "utf8"));
                if (!packageInfo["fullstack-serve"]) {
                    cout(exports.Symbols.MISSING_CONFIG).error();
                    throw new Error(exports.Symbols.MISSING_CONFIG);
                }
                cout("Loading configuration").info();
                this.defaultApiAddress = packageInfo["fullstack-serve"].defaultApiAddress || "localhost";
                this.listenPort = packageInfo["fullstack-serve"].listenPort || 3000;
                this.pathMaps = packageInfo["fullstack-serve"].pathMaps || {};
                this.notifyListeners();
                if (this.currentWatchedConfig !== packagePath) {
                    this.currentWatchedConfig = packagePath;
                    fs.unwatchFile(this.currentWatchedConfig);
                    fs.watchFile(packagePath, (curr, prev) => {
                        this.readPackage(specifiedPath);
                    });
                }
            });
        }
    }
    exports.Config = Config;
});