(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function SendScript(options) {
        const pluginExpressSendScripts = (req, res, next) => {
            if (req.path === options.sharePath) {
                res.sendFile(options.scriptPath);
                return;
            }
            next();
        };
        return pluginExpressSendScripts;
    }
    exports.default = SendScript;
});
