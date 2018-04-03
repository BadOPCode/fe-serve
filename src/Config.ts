/**
 * Config.ts
 * Handles processing configurations
 * @license MIT
 */
import * as fs from "fs";
import * as path from "path";

import * as cout from "cout";
import * as shell from "shelljs";

/**
 * Module that holds token constants
 */
export const Symbols = {
    MISSING_CONFIG: "The package.json does not contain fullstack-serve information.",
    MISSING_LOCALPATH: "The localPath in static mapping was not specified",
    READ_ERROR: "Cannot find specified package.json.",
};

export interface IMapData {
    type: string;
    sharePath: string;
    localPath?: string;
    serverPath?: string;
    mockFile?: string;
    remote?: {
        protocol?: string;
        hostname?: string;
        path?: string;
        port?: number;
    }
}

export interface ITask {
    masks: string[];
    tasks: {
        any?: string;
        onAdd?: string;
        onChange?: string;
        onDelete?: string;
    };
}

export interface IConfigData {
    defaultApiAddress?: string;
    listenPort?: number;
    pathMaps?: {
        [path: string]: IMapData;
    };
    watchTasks?: ITask[];
}

export class Config implements IConfigData {
    public defaultApiAddress: string;
    public listenPort: number;
    public pathMaps: { [path: string]: IMapData};
    public watchTasks: ITask[];
    private currentWatchedConfig: string;
    private listeners: Array<(config: IConfigData) => void> = [];

    public addListener(newListener: (config: IConfigData) => void) {
        this.listeners.push(newListener);
    }

    public notifyListeners() {
        this.listeners.forEach((listener) => {
            listener(this);
        });
    }

    /**
     * readPackage()
     * reads a package.json for the fe serve info
     */
    public readPackage(specifiedPath: string = ".") {
        const packagePath = path.join(specifiedPath, "package.json");

        fs.access(packagePath, fs.constants.R_OK, (err) => {
            if (err) {
                cout(Symbols.READ_ERROR).error();
                throw new Error(Symbols.READ_ERROR);
            }

            const packageInfo = JSON.parse(fs.readFileSync(packagePath, "utf8"));

            if (!packageInfo["fullstack-serve"]) {
                cout(Symbols.MISSING_CONFIG).error();
                throw new Error(Symbols.MISSING_CONFIG);
            }

            cout("Loading configuration").info();

            this.defaultApiAddress = packageInfo["fullstack-serve"].defaultApiAddress || "localhost";
            this.listenPort = packageInfo["fullstack-serve"].listenPort || 3000;
            this.pathMaps = packageInfo["fullstack-serve"].pathMaps || {};
            this.notifyListeners();

            if (this.currentWatchedConfig !== packagePath) {
                this.currentWatchedConfig = packagePath;
                fs.unwatchFile(this.currentWatchedConfig);
                fs.watchFile(packagePath, (curr, prev) => {
                    this.readPackage(specifiedPath);
                });
            }
        });
    }
}
