/**
 * Web.ts
 * Handles the web serving and proxy
 */

// NPM Modules
import * as cout from "cout";
import * as decision from "dt-decisions";
import * as express from "express";
import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import * as path from "path";
import * as serveIndex from "serve-index";
// import * as autoreload from "express-dev-autoreload";

// Internal Modules
import { IConfigData, IMapData, Symbols } from "./Config";

import Reload from "./PluginExpressReload";
import SendScript from "./PluginExpressSendScript";

const SCRIPT_PATH = "/__reload.js";

/**
 * WebServer: Main class for handling all the web functionality.
 */
export class WebServer {
    public app: any = express();
    public web: any = new http.Server(this.app);
    public queue: any[];
    private pvtConfig: IConfigData;
    private isListening: boolean = false;

    constructor() {
    }

    /**
     * processConfig(): Processes specified config data and maps web features
     * accordingly.
     * @param config IConfigData
     */
    public processConfig(config: IConfigData) {
        this.pvtConfig = config;
        this.queue = [];

        // if path maps is defined we need to process it
        if (!!this.pvtConfig.pathMaps) {
            this.unmap();

            this.app.use(SendScript({
                scriptPath: path.join(__dirname, "client.reload.js"),
                sharePath: SCRIPT_PATH,
            }));

            const keys = Object.keys(this.pvtConfig.pathMaps);
            keys.map((key: string) => {
                const pathMap: IMapData = this.pvtConfig.pathMaps[key];
                pathMap.sharePath = key;
                decision({
                    mock: () => this.mapMock(pathMap),
                    proxy: () => this.mapProxy(pathMap),
                    static: () => this.mapStatic(pathMap),
                })(pathMap.type);
            });
        }

        this.setPort(this.pvtConfig.listenPort);
    }

    /**
     * mapStatic(): Adds a route to static content. Also has directory indexing.
     * @param data IMapData {type, sharePath, localPath}
     */
    public mapStatic(data: IMapData) {
        if (!data.localPath) {
            throw new Error(Symbols.MISSING_LOCALPATH);
        }

        cout(`Mapping static path ${data.sharePath} to ${data.localPath}`).info();

        this.app.use(data.sharePath, express.static(data.localPath));
        // this.app.use(data.sharePath, Reload({
        //     scriptPath: SCRIPT_PATH,
        //     webServer: this.web,
        // }));
        this.app.use(data.sharePath, serveIndex(data.localPath));
    }

    /**
     * mapProxy(): Maps a route that will proxy to a external webserver.
     * @param data IMapData {type, sharePath, serverPath}
     */
    public mapProxy(data: IMapData) {
        cout(`Mapping proxy path from ${data.sharePath} to ${data.serverPath}`).info();
        this.app.all(data.sharePath, (req: any, res: any) => {
            const method = req.method;

            https.get({
                hostname: data.serverPath,
                path: req.path,
            }, (serverRes) => {
                res.writeHead(serverRes.statusCode, serverRes.headers);
                res.pipe(serverRes);
                serverRes.pipe(res);
            });
        });
    }

    /**
     * mapMock(): Maps a file or script that can mock a endpoint.
     * @param data IMapData {type, sharePath, mockFile}
     */
    public mapMock(data: IMapData) {
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

    /**
     * unmap(): Unmaps all of the routes previously mapped.
     */
    public unmap() {
        if (this.app._router && this.app._router.stack.length) {
            this.app._router.stack = [];
        }
    }

    /**
     * closeServer(): Stops the listening thread.
     */
    public closeServer() {
        this.web.close();
        this.isListening = false;
    }

    /**
     * setPort(): Sets the listener to specified port.
     * @param listenPort number
     */
    public setPort(listenPort: number) {
        if (this.isListening) {
            this.closeServer();
        }

        this.web = this.app.listen(listenPort, () => {
            cout(`Listening on port ${listenPort}`).info();
            this.isListening = true;
        });
    }
}
