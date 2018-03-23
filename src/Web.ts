/**
 * Web.ts
 * Handles the web serving and proxy
 */

//NPM Modules
import * as fs from "fs";
import * as express from "express";
import * as serveIndex from "serve-index";
import * as https from "https";
import * as cout from "cout";
import * as decision from "dt-decisions";
import * as autoreload from "express-dev-autoreload";

//Internal Modules
import { IConfigData, IMapData } from "./Config";

export class WebServer {
    app: any = express();
    web: any;
    private _config: IConfigData;
    private isListening: boolean = false;

    processConfig(config: IConfigData) {
        this._config = config;

        if (!this._config.pathMaps) {
            return;
        }

        this.unmap();
        const keys = Object.keys(this._config.pathMaps);
        keys.map((key: string) => {
            const pathMap: IMapData = this._config.pathMaps[key];
            pathMap.sharePath = key;
            decision({
                'static': () => this.mapStatic(pathMap),
                'proxy': () => this.mapProxy(pathMap),
                'mock': () => this.mapMock(pathMap),
            })(pathMap.type);
        });

        this.setPort(this._config.listenPort);
    }

    mapStatic(data: IMapData) {
        if (!data.localPath)
            return

        cout(`Mapping static path ${data.sharePath} to ${data.localPath}`).info();
        this.app.use(data.sharePath, express.static(data.localPath));
        this.app.use(data.sharePath, serveIndex(data.localPath));
        this.app.use(data.sharePath, autoreload({}));
    }

    mapProxy(data: IMapData) {
        cout(`Mapping proxy path from ${data.sharePath} to ${data.serverPath}`).info();
        this.app.all(data.sharePath, (req: any, res: any) => {
            https.get({
                hostname: data.serverPath,
                path: req.path
            }, (serverRes) => {
                res.writeHead(serverRes.statusCode, serverRes.headers);
                res.pipe(serverRes);
                serverRes.pipe(res);
            });
        });
    }

    mapMock(data: IMapData) {
        cout(`Mapping path ${data.sharePath} to mock data ${data.mockFile}`).info();
        fs.access(data.mockFile, fs.constants.R_OK, (err) => {
            if (!err) {
                this.app.all(data.sharePath, (req: any, res: any) => {
                    const mockStream = fs.createReadStream(data.mockFile);
                    mockStream.pipe(res);
                });
            }
        });
    }

    unmap() {
        if (this.app._router && this.app._router.stack.length)
            this.app._router.stack = [];
    }

    closeServer() {
        this.web.close();
        this.isListening = false;
    }

    setPort(listenPort: number) {
        if (this.isListening) 
            this.closeServer();

        this.web = this.app.listen(listenPort, () => {
            cout(`Listening on port ${listenPort}`).info();
            this.isListening = true;
        });
    }
}