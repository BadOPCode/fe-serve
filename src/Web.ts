/**
 * Web.ts:
 * Handles the web serving and proxy
 */

// NPM Modules
import * as cout from "cout";
import * as decision from "dt-decisions";
import * as express from "express";
import * as fs from "fs";
import * as http from "http";
import * as path from "path";
import * as serveIndex from "serve-index";
import * as SocketIO from "socket.io";
import * as watch from "glob-watcher";

// Internal Modules
import { IConfigData, IMapData, Symbols } from "./Config";
import { IMockEndpoint, MockEndpoint } from "./MockEndpoint";
import { ProxyEndpoint } from "./ProxyEndpoint";

import Static from "./PluginExpressStatic";
import SendScript from "./PluginExpressSendScript";

const SCRIPT_ROUTE = "/__fullstack.js";
const SOCKETIO_ROUTE = "/socket.io/socket.io.js";
const SOCKETIO_PATH = path.join(require.resolve("socket.io-client"), "..", "..", "dist", "socket.io.js");
const SCRIPT_TAG = `<script src=\"${SOCKETIO_ROUTE}\"></script><script src=\"${SCRIPT_ROUTE}\"><\/script>`;

/**
 * WebServer: Main class for handling all the web functionality.
 */
export class WebServer {
    public app: any;
    public server: any;
    public io: SocketIO.Server;
    public mockEp: MockEndpoint;
    public proxyEp: ProxyEndpoint;
    public queue: any[];
    private pvtConfig: IConfigData;
    public isListening: boolean = false;

    constructor() {
        this.app = express();
        this.server = new http.Server(this.app);
        this.addWebSocket();
        this.mockEp = new MockEndpoint(this.app);
        this.proxyEp = new ProxyEndpoint(this.app);
    }

    public addWebSocket() {
        this.io = SocketIO(this.server);
        this.io.on('connect', (socket: any) => {
            this.queue.push(socket);

            socket.on('disconnect', () => {
            });
        });
    }

    public writeToQueue(cmd: string, value: any) {
        this.io.emit(cmd, value);
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
            this.app.use(SendScript({
                scriptPath: path.join(__dirname, "client", "FullstackClient.js"),
                sharePath: SCRIPT_ROUTE,
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

        this.setPort(this.pvtConfig.listenPort || 8000);
    }

    /**
     * mapStatic(): Adds a route to static content. Also has directory indexing.
     * @param data IMapData {type, sharePath, localPath}
     */
    public mapStatic(data: IMapData) {
        if (!data.localPath) {
            throw new Error(Symbols.MISSING_LOCALPATH);
        }

        cout(`Mapping static path from ${data.sharePath} to ${data.localPath}`).verbose();

        this.app.use(Static({
            injectedText: SCRIPT_TAG,
            localPath: data.localPath,
            serverRoute: data.sharePath,
        }));

        const pathStr = data.localPath + "/**/*";
        const pathWatch = watch([pathStr]);

        pathWatch.on('add', (path: string, stat: any)=>{ this.writeToQueue("browser command", "reload") });
        pathWatch.on('change', (path: string, stat: any)=>{ this.writeToQueue("browser command", "reload") });
        pathWatch.on('unlink', (path: string, stat: any)=>{ this.writeToQueue("browser command", "reload") });

        this.app.use(data.sharePath, serveIndex(data.localPath));
    }

    /**
     * mapProxy(): Maps a route that will proxy to a external webserver.
     * @param data IMapData {type, sharePath, serverPath}
     */
    public mapProxy(data: IMapData) {
        cout(`Mapping proxy path from ${data.sharePath} to ${data.serverPath}`).verbose();
        this.proxyEp.addProxyRoute(data.sharePath, data.remote);
    }

    /**
     * mapMock(): Maps a file or script that can mock a endpoint.
     * @param data IMapData {type, sharePath, mockFile}
     */
    public mapMock(data: IMapData) {
        cout(`Mapping mock path from ${data.sharePath} to ${data.mockFile}`).verbose();
        this.mockEp.addFile(data.sharePath, data.mockFile);
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
        this.server.close();
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

        this.server.listen(listenPort, () => {
            cout(`Listening on port ${listenPort}`).info();
            this.isListening = true;
        });

    }
}
