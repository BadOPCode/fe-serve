(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "cout", "http"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const cout = require("cout");
    const http = require("http");
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
                const method = req.method;
                console.log("req.url", req.url);
                const fixedSharePath = sharePath.replace(/\//g, "\/");
                const pattern = RegExp(`.*${fixedSharePath}(.*\?.*)$`);
                const paths = req.url.match(pattern);
                const serverPath = serverOpts.path + paths[1];
                console.log("serverPath", serverPath);
                const options = {
                    hostname: serverOpts.hostname,
                    path: serverPath,
                    method: method,
                    port: serverOpts.ports
                };
                const serverRes = (serverRes) => {
                    res.writeHead(serverRes.statusCode, serverRes.headers);
                    res.pipe(serverRes);
                    serverRes.pipe(res);
                };
                if (serverOpts.protocol == "http") {
                    http.get(options, serverRes);
                    // http[method](
                    //     options,
                    //     serverRes
                    // );
                }
                if (serverOpts.protocol == "https") {
                    // https[method](
                    //     options,
                    //     serverRes
                    // );
                }
            });
        }
    }
    exports.ProxyEndpoint = ProxyEndpoint;
});
