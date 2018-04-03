import { IConfigData } from "./Config";
import * as fs from "fs";
import * as path from "path";
/**
 * MockApi.ts:
 * 
 */

export interface IMockEndpoint {
    run: (req: any, res: any) => void;
}

/**
 * MockApi:
 * Class searches specified directories for scripts that add routes.
 */
export class MockEndpointAPI {
    constructor(public server: any) {
    }

    addFile(sharePath: string, fileName: string) {
        const filePath = path.join(__dirname, "..", fileName);
        console.log("filePath", filePath);
        fs.access(filePath, fs.constants.R_OK, (err:any) => {
            if (err) return;

            const newScript:IMockEndpoint = require(filePath);
            this.server.all(sharePath, newScript.run);
        });
    }
}
