/**
 * PluginExpressReload.ts: Plugin for Express 4.x that will inject a JS in
 * the body of a HTML and than reload the page on a change.
 * Based off of express-dev-reload by Moritz(mo22)
 */
// import * as expressModifyResponse from "express-modify-response";
import * as cout from "cout";
import * as fs from "fs";
import * as mime from "mime";
import * as path from "path";

export interface IPluginOptions {
    localPath: string;
    serverRoute: string;
    injectedText: string;
}

export default function Static(options: IPluginOptions) {
    let pushState: boolean = false;
    let pushFile: string;
    const serverRoute: string = options.serverRoute;
    let localPath: string = options.localPath;

    // specified local path is a pushstate
    if (options.localPath.match(/\.html?/)) {
        pushState = true;
        pushFile = path.basename(options.localPath);
        localPath = path.dirname(options.localPath);
    }

    // get the extra beyond the path
    function getExtraRequest(request: string): string {
        const match = RegExp(options.serverRoute + "(.*)$");
        const pathMatches = request.match(match);
        let retStr = "";
        if (pathMatches) { retStr = pathMatches[1]; }

        return retStr;
    }

    function outputFile(fileLocation: string, req: any, res: any, next: () => void) {
        const filetype = mime.getType(fileLocation);
        res.setHeader("Content-Type", filetype);

        const fileStream = fs.createReadStream(fileLocation);
        const bodyPattern = /<\/\s*body(\s.*)?>/gi;

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
    }

    const pluginExpressStatic = (req: any, res: any, next: () => void) => {
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
            } else {
                if (pushState) {
                    attemptFileLocation = path.join(process.cwd(), options.localPath);
                    outputFile(attemptFileLocation, req, res, next);
                } else {
                    next();
                    return;
                }
            }
        } catch (err) {
            if (pushState) {
                attemptFileLocation = path.join(process.cwd(), options.localPath);
                outputFile(attemptFileLocation, req, res, next);
            } else {
                next();
                return;
            }
        }

    };

    return pluginExpressStatic;
}
