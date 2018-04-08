/**
 * PluginExpressReload.ts: Plugin for Express 4.x that will inject a JS in
 * the body of a HTML and than reload the page on a change.
 * Based off of express-dev-reload by Moritz(mo22)
 */
// import * as expressModifyResponse from "express-modify-response";
import * as fs from "fs";
import * as path from "path";
import * as mime from "mime";
import * as cout from "cout";

export interface IPluginOptions {
    localPath: string;
    serverRoute: string;
    injectedText: string;
}

export default function Static(options: IPluginOptions) {
    // console.log("Plugin loaded", options.webServer);

    const pluginExpressStatic = (req: any, res: any, next: () => void) => {
        if (!req.path) return;
        if (!req.path.match(/\/$/)) {
            const match = RegExp(options.serverRoute + "(.*)$");
            let fileLocation: string;
            const pathLocation = req.path.match(match);

            if (pathLocation !== null) {
                fileLocation = path.join(options.localPath, pathLocation[1]);
            } else {
                next();
                return;
            }

            fs.access(fileLocation, fs.constants.R_OK, (err) => {
                if (err) {
                    next();
                    return;
                }
                const filetype = mime.getType(fileLocation);
                res.setHeader('Content-Type', filetype);
                
                const fileStream = fs.createReadStream(fileLocation);
                const bodyPattern = /<\/\s*?body\s?.*>/gi;

                fileStream.on("data", (chunk) => {
                    let strChunk = chunk.toString("utf8");
                    if (strChunk.match(bodyPattern)) {
                        strChunk = strChunk.replace(bodyPattern, options.injectedText + "$&");
                        res.write(strChunk);
                    } else {
                        res.write(chunk);
                    }
                });

                fileStream.on("end", () => {
                    res.end();
                    next();
                });
            });
        } else {
            next();
        }
    };

    return pluginExpressStatic;
}
