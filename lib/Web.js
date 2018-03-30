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
        define(["require", "exports", "cout", "dt-decisions", "express", "fs", "http", "https", "path", "serve-index", "./Config", "./PluginExpressSendScript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // NPM Modules
    const cout = require("cout");
    const decision = require("dt-decisions");
    const express = require("express");
    const fs = require("fs");
    const http = require("http");
    const https = require("https");
    const path = require("path");
    const serveIndex = require("serve-index");
    // import * as autoreload from "express-dev-autoreload";
    // Internal Modules
    const Config_1 = require("./Config");
    const PluginExpressSendScript_1 = require("./PluginExpressSendScript");
    const SCRIPT_PATH = "/__reload.js";
    /**
     * WebServer: Main class for handling all the web functionality.
     */
    class WebServer {
        constructor() {
            this.app = express();
            this.web = new http.Server(this.app);
            this.isListening = false;
        }
        /**
         * processConfig(): Processes specified config data and maps web features
         * accordingly.
         * @param config IConfigData
         */
        processConfig(config) {
            this.pvtConfig = config;
            this.queue = [];
            // if path maps is defined we need to process it
            if (!!this.pvtConfig.pathMaps) {
                this.unmap();
                this.app.use(PluginExpressSendScript_1.default({
                    scriptPath: path.join(__dirname, "client.reload.js"),
                    sharePath: SCRIPT_PATH,
                }));
                const keys = Object.keys(this.pvtConfig.pathMaps);
                keys.map((key) => {
                    const pathMap = this.pvtConfig.pathMaps[key];
                    pathMap.sharePath = key;
                    decision({
                        mock: () => this.mapMock(pathMap),
                        proxy: () => this.mapProxy(pathMap),
                        static: () => this.mapStatic(pathMap),
                    })(pathMap.type);
                });
            }
            this.setPort(this.pvtConfig.listenPort);
        }
        /**
         * mapStatic(): Adds a route to static content. Also has directory indexing.
         * @param data IMapData {type, sharePath, localPath}
         */
        mapStatic(data) {
            if (!data.localPath) {
                throw new Error(Config_1.Symbols.MISSING_LOCALPATH);
            }
            cout(`Mapping static path ${data.sharePath} to ${data.localPath}`).info();
            this.app.use(data.sharePath, express.static(data.localPath));
            // this.app.use(data.sharePath, Reload({
            //     scriptPath: SCRIPT_PATH,
            //     webServer: this.web,
            // }));
            this.app.use(data.sharePath, serveIndex(data.localPath));
        }
        /**
         * mapProxy(): Maps a route that will proxy to a external webserver.
         * @param data IMapData {type, sharePath, serverPath}
         */
        mapProxy(data) {
            cout(`Mapping proxy path from ${data.sharePath} to ${data.serverPath}`).info();
            this.app.all(data.sharePath, (req, res) => {
                const method = req.method;
                https.get({
                    hostname: data.serverPath,
                    path: req.path,
                }, (serverRes) => {
                    res.writeHead(serverRes.statusCode, serverRes.headers);
                    res.pipe(serverRes);
                    serverRes.pipe(res);
                });
            });
        }
        /**
         * mapMock(): Maps a file or script that can mock a endpoint.
         * @param data IMapData {type, sharePath, mockFile}
         */
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
        /**
         * unmap(): Unmaps all of the routes previously mapped.
         */
        unmap() {
            if (this.app._router && this.app._router.stack.length) {
                this.app._router.stack = [];
            }
        }
        /**
         * closeServer(): Stops the listening thread.
         */
        closeServer() {
            this.web.close();
            this.isListening = false;
        }
        /**
         * setPort(): Sets the listener to specified port.
         * @param listenPort number
         */
        setPort(listenPort) {
            if (this.isListening) {
                this.closeServer();
            }
            this.web = this.app.listen(listenPort, () => {
                cout(`Listening on port ${listenPort}`).info();
                this.isListening = true;
            });
        }
    }
    exports.WebServer = WebServer;
});
