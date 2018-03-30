/**
 * PluginExpressReload.ts: Plugin for Express 4.x that will inject a JS in
 * the body of a HTML and than reload the page on a change.
 * Based off of express-dev-reload by Moritz(mo22)
 */
import * as expressModifyResponse from "express-modify-response";
import * as fs from "fs";

export interface IPluginOptions {
    webServer: any;
    scriptPath: string;
}

export default function Reload(options: IPluginOptions) {
    console.log("Plugin loaded", options.webServer);

    const pluginExpressReload = (req: any, res: any, next: () => void) => {
        console.log("req.path", req.path);

        expressModifyResponse(
            (modReq: any, modRes: any) => {
                const modifyRes = (modRes.getHeader("Content-Type") &&
                    modRes.getHeader("Content-Type").startsWith("text/html"));
                console.log("modifyRes", modifyRes);
                return modifyRes;
            },
            (modReq: any, modRes: any, body: any) => {
                let modBody = body.toString();
                let pos = modBody.search(new RegExp("</ *body *>", "i"));

                if (pos === -1) {
                    pos = modBody.length;
                }

                modBody = modBody.slice(0, pos) +
                    `\n<script src="${options.scriptPath}"></script>\n` +
                    modBody.slice(pos);

                return modBody;
            },
        )(req, res, next);

        next();
    };

    return pluginExpressReload;
}
