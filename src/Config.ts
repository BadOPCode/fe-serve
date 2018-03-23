/**
 * Config.ts
 * Handles processing configurations
 * @license MIT
 */
import * as fs from "fs";
import * as path from "path";

import * as cout from "cout";
import * as shell from "shelljs";

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
    }
}

export class Config implements IConfigData {
    defaultApiAddress: string;
    listenPort: number;
    pathMaps: { [path: string]: IMapData};
    private currentWatchedConfig: string;
    private listeners: Array<(config: IConfigData) => void> = [];

    addListener(newListener:(config:IConfigData)=>void) {
        this.listeners.push(newListener);
    }

    notifyListeners() {
        this.listeners.forEach((listener) => {
            listener(this);
        });
    }

    /**
     * readPackage()
     * reads a package.json for the fe serve info
     */
    readPackage(specifiedPath: string = ".") {
        const packagePath = path.join(specifiedPath, 'package.json');
        
        fs.access(packagePath, fs.constants.R_OK, (err) => {
            if (err) {
                cout('Cannot find specified package.json').error();
                process.exit();
            }

            let packageInfo = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
            if (!packageInfo['fe-serve']) {
                cout('The package.json does not contain fe-serve information').error();
                process.exit(1);
            }

            cout("Loading configuration").info();
    
            this.defaultApiAddress = packageInfo['fe-serve'].defaultApiAddress || "localhost";
            this.listenPort = packageInfo['fe-serve'].listenPort || 3000;
            this.pathMaps = packageInfo['fe-serve'].pathMaps || {};
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