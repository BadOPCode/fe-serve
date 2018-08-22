(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "mime", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const fs = require("fs");
    const mime = require("mime");
    const path = require("path");
    function Static(options) {
        let pushState = false;
        let pushFile;
        const serverRoute = options.serverRoute;
        let localPath = options.localPath;
        // specified local path is a pushstate
        if (options.localPath.match(/\.html?/)) {
            pushState = true;
            pushFile = path.basename(options.localPath);
            localPath = path.dirname(options.localPath);
        }
        // get the extra beyond the path
        function getExtraRequest(request) {
            const match = RegExp(options.serverRoute + "(.*)$");
            const pathMatches = request.match(match);
            let retStr = "";
            if (pathMatches) {
                retStr = pathMatches[1];
            }
            return retStr;
        }
        function outputFile(fileLocation, req, res, next) {
            const filetype = mime.getType(fileLocation);
            res.setHeader("Content-Type", filetype);
            const fileStream = fs.createReadStream(fileLocation);
            const bodyPattern = /<\/\s*body(\s.*)?>/gi;
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
        }
        const pluginExpressStatic = (req, res, next) => {
            const fixedRoute = options.serverRoute.replace("/", "\/");
            const srvPattern = RegExp(fixedRoute + ".*");
            if (!req.path || !req.path.match(srvPattern)) {
                next();
                return;
            }
            const dirPat = RegExp(fixedRoute + "\/?$");
            if (!pushState && !!req.path.match(dirPat)) {
                next();
                return;
            }
            const extraReq = getExtraRequest(req.path);
            let attemptFileLocation;
            try {
                attemptFileLocation = path.join(process.cwd(), localPath, extraReq);
                fs.accessSync(attemptFileLocation, fs.constants.R_OK);
                if (fs.lstatSync(attemptFileLocation).isFile()) {
                    outputFile(attemptFileLocation, req, res, next);
                }
                else {
                    if (pushState) {
                        attemptFileLocation = path.join(process.cwd(), options.localPath);
                        outputFile(attemptFileLocation, req, res, next);
                    }
                    else {
                        next();
                        return;
                    }
                }
            }
            catch (err) {
                if (pushState) {
                    attemptFileLocation = path.join(process.cwd(), options.localPath);
                    outputFile(attemptFileLocation, req, res, next);
                }
                else {
                    next();
                    return;
                }
            }
        };
        return pluginExpressStatic;
    }
    exports.default = Static;
});
