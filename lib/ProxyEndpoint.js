(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "cout", "http", "https"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const cout = require("cout");
    const http = require("http");
    const https = require("https");
    /**
      * ProxyServer
      */
    class ProxyEndpoint {
        constructor(server) {
            this.server = server;
        }
        addProxyRoute(sharePath, serverOpts) {
            cout(`Mapping proxy path from ${sharePath} to ${serverOpts.hostname}`).info();
            this.server.all(sharePath, (req, res) => {
                const method = req.method.toUpperCase();
                const fixedSharePath = sharePath.replace(/\//g, "\/");
                const pattern = RegExp(`.*${fixedSharePath}(.*\?.*)$`);
                const paths = req.url.match(pattern);
                const serverPath = serverOpts.path + paths[1];
                const options = {
                    hostname: serverOpts.hostname,
                    path: serverPath,
                    method: method,
                    port: serverOpts.ports || (serverOpts.protocol === "http" ? 80 : 443)
                };
                const serverRes = (serverRes) => {
                    res.writeHead(serverRes.statusCode, serverRes.headers);
                    res.pipe(serverRes);
                    serverRes.pipe(res);
                };
                if (serverOpts.protocol == "http") {
                    const req = http.request(options, serverRes);
                    req.end();
                }
                if (serverOpts.protocol == "https") {
                    const req = https.request(options, serverRes);
                    req.end();
                }
            });
        }
    }
    exports.ProxyEndpoint = ProxyEndpoint;
});
