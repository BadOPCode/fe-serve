(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "cout", "express", "http", "path", "socket.io"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const cout = require("cout");
    const express = require("express");
    const http = require("http");
    const path = require("path");
    const SocketIO = require("socket.io");
    const ADMIN_PATH = path.join(__dirname, "admin");
    class WebAdminServer {
        constructor() {
            this.isListening = false;
            this.app = express();
            this.server = new http.Server(this.app);
            this.io = SocketIO(this.server);
            this.initRoutes();
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
        /**
         * Initializes the routes used by admin server.
         * @method initRoutes
         */
        initRoutes() {
            this.app.get("/", (req, res) => {
                res.sendFile(path.join(ADMIN_PATH, "html", "index.html"));
            });
            this.app.use("/html", express.static(path.join(ADMIN_PATH, "html")));
            this.app.use("/js", express.static(path.join(ADMIN_PATH, "js")));
        }
    }
    exports.WebAdminServer = WebAdminServer;
});
