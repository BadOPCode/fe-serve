/**
 * Web.ts
 * Handles the web serving and proxy
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "express", "serve-index", "https", "cout", "dt-decisions", "express-dev-autoreload"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //NPM Modules
    const fs = require("fs");
    const express = require("express");
    const serveIndex = require("serve-index");
    const https = require("https");
    const cout = require("cout");
    const decision = require("dt-decisions");
    const autoreload = require("express-dev-autoreload");
    class WebServer {
        constructor() {
            this.app = express();
            this.isListening = false;
        }
        processConfig(config) {
            this._config = config;
            if (!this._config.pathMaps) {
                return;
            }
            this.unmap();
            const keys = Object.keys(this._config.pathMaps);
            keys.map((key) => {
                const pathMap = this._config.pathMaps[key];
                pathMap.sharePath = key;
                decision({
                    'static': () => this.mapStatic(pathMap),
                    'proxy': () => this.mapProxy(pathMap),
                    'mock': () => this.mapMock(pathMap),
                })(pathMap.type);
            });
            this.setPort(this._config.listenPort);
        }
        mapStatic(data) {
            if (!data.localPath)
                return;
            cout(`Mapping static path ${data.sharePath} to ${data.localPath}`).info();
            this.app.use(data.sharePath, express.static(data.localPath));
            this.app.use(data.sharePath, serveIndex(data.localPath));
            this.app.use(data.sharePath, autoreload({}));
        }
        mapProxy(data) {
            cout(`Mapping proxy path from ${data.sharePath} to ${data.serverPath}`).info();
            this.app.get(data.sharePath, (req, res) => {
                https.get({
                    hostname: data.serverPath,
                    path: req.path
                }, (serverRes) => {
                    res.writeHead(serverRes.statusCode, serverRes.headers);
                    res.pipe(serverRes);
                    serverRes.pipe(res);
                });
            });
        }
        mapMock(data) {
            cout(`Mapping path ${data.sharePath} to mock data ${data.mockFile}`).info();
            fs.access(data.mockFile, fs.constants.R_OK, (err) => {
                if (!err) {
                    this.app.all(data.sharePath, (req, res) => {
                        const mockStream = fs.createReadStream(data.mockFile);
                        mockStream.pipe(res);
                    });
                }
            });
        }
        unmap() {
            if (this.app._router && this.app._router.stack.length)
                this.app._router.stack = [];
        }
        closeServer() {
            this.web.close();
            this.isListening = false;
        }
        setPort(listenPort) {
            if (this.isListening)
                this.closeServer();
            this.web = this.app.listen(listenPort, () => {
                cout(`Listening on port ${listenPort}`).info();
                this.isListening = true;
            });
        }
    }
    exports.WebServer = WebServer;
});
