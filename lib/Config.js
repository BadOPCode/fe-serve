(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "path", "cout"], factory);
    }
})(function (require, exports) {
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
            const packagePath = path.join(specifiedPath, 'package.json');
            fs.access(packagePath, fs.constants.R_OK, (err) => {
                if (err) {
                    cout('Cannot find specified package.json').error();
                    process.exit();
                }
                let packageInfo = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                if (!packageInfo['fe-serve']) {
                    cout('The package.json does not contain fe-serve information').error();
                    process.exit(1);
                }
                cout("Loading configuration").info();
                this.defaultApiAddress = packageInfo['fe-serve'].defaultApiAddress || "localhost";
                this.listenPort = packageInfo['fe-serve'].listenPort || 3000;
                this.pathMaps = packageInfo['fe-serve'].pathMaps || {};
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
