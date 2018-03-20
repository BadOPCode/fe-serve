/**
 * Config.ts
 * Handles processing configurations
 * @license MIT
 */
import * as fs from "fs";
import * as path from "path";

import * as cout from "cout";
import * as shell from "shelljs";

interface IMapData {
    type: string;
    path: string;
}

export interface IConfigData {
    defaultApiAddress: string;
    listenPort: number;
    pathMaps: {
        (path: string): IMapData;
    }
}

export class Config {
    private _configData: IConfigData;

    /**
     * readPackage()
     * reads a package.json for the fe serve info
     */
    readPackage(specifiedPath: string = ".") {
        const packagePath = path.join(specifiedPath, 'package.json'); 
        let packageInfo = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        if (!packageInfo['fe-serve']) {
            cout('The package.json does not contain local-serve information').error();
            process.exit(1);
        }

        this._configData = packageInfo['fe-serve'];
    }
}