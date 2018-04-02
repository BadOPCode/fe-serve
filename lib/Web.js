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
        define(["require", "exports", "cout", "dt-decisions", "express", "fs", "http", "https", "path", "serve-index", "socket.io", "glob-watcher", "./Config", "./PluginExpressStatic", "./PluginExpressSendScript"], factory);
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
    const SocketIO = require("socket.io");
    const watch = require("glob-watcher");
    // Internal Modules
    const Config_1 = require("./Config");
    const PluginExpressStatic_1 = require("./PluginExpressStatic");
    const PluginExpressSendScript_1 = require("./PluginExpressSendScript");
    const SCRIPT_ROUTE = "/__fullstack.js";
    const SOCKETIO_ROUTE = "/socket.io/socket.io.js";
    const SOCKETIO_PATH = path.join(require.resolve("socket.io-client"), "..", "..", "dist", "socket.io.js");
    const SCRIPT_TAG = `<script src=\"${SOCKETIO_ROUTE}\"></script><script src=\"${SCRIPT_ROUTE}\"><\/script>`;
    /**
     * WebServer: Main class for handling all the web functionality.
     */
    class WebServer {
        constructor() {
            this.isListening = false;
            this.app = express();
            this.server = new http.Server(this.app);
            this.addWebSocket();
        }
        addWebSocket() {
            this.io = SocketIO(this.server);
            this.io.on('connect', (socket) => {
                this.queue.push(socket);
                // console.log('Connected client on port');
                // socket.on('message', (m: Message) => {
                //     console.log('[server](message): %s', JSON.stringify(m));
                //     this.io.emit('message', m);
                // }); 
                socket.emit('events', { hello: 'world' });
                socket.on('disconnect', () => {
                    // console.log('Client disconnected');
                });
            });
        }
        writeToQueue(cmd, value) {
            console.log("command", cmd, value);
            this.io.emit(cmd, value);
            // this.queue.forEach((socket) => {
            //     socket.emit(cmd, value);
            // });
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
                    scriptPath: path.join(__dirname, "client", "FullstackClient.js"),
                    sharePath: SCRIPT_ROUTE,
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
            this.app.use(PluginExpressStatic_1.default({
                injectedText: SCRIPT_TAG,
                localPath: data.localPath,
                serverRoute: data.sharePath,
            }));
            const pathStr = data.localPath + "/**/*";
            const pathWatch = watch([pathStr]);
            pathWatch.on('add', (path, stat) => { this.writeToQueue("browser command", "reload"); });
            pathWatch.on('change', (path, stat) => { this.writeToQueue("browser command", "reload"); });
            pathWatch.on('unlink', (path, stat) => { this.writeToQueue("browser command", "reload"); });
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
            this.server.close();
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
            this.server.listen(listenPort, () => {
                cout(`Listening on port ${listenPort}`).info();
                this.isListening = true;
            });
        }
    }
    exports.WebServer = WebServer;
});