/**
 * Web.ts
 * Handles the web serving and proxy
 */
//NPM Modules
import * as express from "express";
import * as serveIndex from "serve-index";
import * as https from "https";
import * as cout from "cout";

//Internal Modules
import { IConfigData } from "./Config";

export class WebServer {
    web:any = express();
    config: IConfigData;

    processConfig(config: IConfigData) {
        this.config = config;
    }

    mapStatic(sharePath: string, localPath: string) {
        this.web.use(sharePath, express.static(localPath));
        this.web.use(sharePath, serveIndex(localPath));
    }

    mapProxy(sharePath: string, serverPath: string) {
        this.web.get(sharePath, (req, res) => {
            https.get({
                hostname: serverPath,
                path: req.path
            }, (serverRes) => {
                res.writeHead(serverRes.statusCode, serverRes.headers);
                res.pipe(serverRes);
                serverRes.pipe(res);
            });
        });
    }

    mapMock(sharePath: string, mockFile: string) {
        
    }

    setPort(listenPort: number) {
        this.web.listen(listenPort);
        cout(`Listening on port ${listenPort}`).info();
    }
}