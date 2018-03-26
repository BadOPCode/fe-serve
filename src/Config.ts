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
    MISSING_CONFIG: "The package.json does not contain fe-serve information.",
    MISSING_LOCALPATH: "The localPath in static mapping was not specified",
    READ_ERROR: "Cannot find specified package.json.",
};

export interface IMapData {
    type: string;
    sharePath: string;
    localPath?: string;
    serverPath?: string;
    mockFile?: string;
}

export interface IConfigData {
    defaultApiAddress: string;
    listenPort: number;
    pathMaps: {
        [path: string]: IMapData;
    };
}

export class Config implements IConfigData {
    public defaultApiAddress: string;
    public listenPort: number;
    public pathMaps: { [path: string]: IMapData};
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

            if (!packageInfo["fe-serve"]) {
                cout(Symbols.MISSING_CONFIG).error();
                throw new Error(Symbols.MISSING_CONFIG);
            }

            cout("Loading configuration").info();

            this.defaultApiAddress = packageInfo["fe-serve"].defaultApiAddress || "localhost";
            this.listenPort = packageInfo["fe-serve"].listenPort || 3000;
            this.pathMaps = packageInfo["fe-serve"].pathMaps || {};
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
