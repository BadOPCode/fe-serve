(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "express-modify-response"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * PluginExpressReload.ts: Plugin for Express 4.x that will inject a JS in
     * the body of a HTML and than reload the page on a change.
     * Based off of express-dev-reload by Moritz(mo22)
     */
    const expressModifyResponse = require("express-modify-response");
    function Reload(options) {
        console.log("Plugin loaded", options.webServer);
        const pluginExpressReload = (req, res, next) => {
            console.log("req.path", req.path);
            expressModifyResponse((modReq, modRes) => {
                const modifyRes = (modRes.getHeader("Content-Type") &&
                    modRes.getHeader("Content-Type").startsWith("text/html"));
                console.log("modifyRes", modifyRes);
                return modifyRes;
            }, (modReq, modRes, body) => {
                let modBody = body.toString();
                let pos = modBody.search(new RegExp("</ *body *>", "i"));
                if (pos === -1) {
                    pos = modBody.length;
                }
                modBody = modBody.slice(0, pos) +
                    `\n<script src="${options.scriptPath}"></script>\n` +
                    modBody.slice(pos);
                return modBody;
            })(req, res, next);
            next();
        };
        return pluginExpressReload;
    }
    exports.default = Reload;
});
