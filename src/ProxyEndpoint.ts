/**
 * Proxy.ts:
 * Module contains proxy code.
 */
import * as path from "path";
import * as cout from "cout";
import * as http from "http";
import * as https from "https";
import { config } from "shelljs";

interface http {
    [key: string]: any;    
}

/**
  * ProxyServer
  */
export class ProxyEndpoint {
    constructor(public server: any) {}

    addProxyRoute(sharePath: string, serverOpts: any) {
        cout(`Mapping proxy path from ${sharePath} to ${serverOpts.hostname}`).info();
        this.server.all(sharePath, (req: any, res: any) => {
            const method: string = req.method.toUpperCase();

            const fixedSharePath = sharePath.replace(/\//g, "\/");
            const pattern = RegExp(`.*${fixedSharePath}(.*\?.*)$`);
            const paths = req.url.match(pattern);
            const serverPath = serverOpts.path + paths[1];

            const options = {
                hostname: serverOpts.hostname,
                path: serverPath,
                method: method,
                port: serverOpts.ports || (serverOpts.protocol==="http" ? 80 : 443)
            };

            const serverRes = (serverRes: any) => {
                res.writeHead(serverRes.statusCode, serverRes.headers);
                res.pipe(serverRes);
                serverRes.pipe(res);
            }

            if (serverOpts.protocol == "http") {
                const req = http.request(options, serverRes);
                req.end();
            }
            if (serverOpts.protocol == "https") {
                const req = https.request(options, serverRes);
                req.end();
            }
        });
    }
}