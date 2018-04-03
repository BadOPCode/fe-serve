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
            const method: string = req.method;

            console.log("req.url", req.url);
            const fixedSharePath = sharePath.replace(/\//g, "\/");
            const pattern = RegExp(`.*${fixedSharePath}(.*\?.*)$`);
            const paths = req.url.match(pattern);
            const serverPath = serverOpts.path + paths[1];
            console.log("serverPath", serverPath);

            const options = {
                hostname: serverOpts.hostname,
                path: serverPath,
                method: method,
                port: serverOpts.ports
            }

            const serverRes = (serverRes: any) => {
                res.writeHead(serverRes.statusCode, serverRes.headers);
                res.pipe(serverRes);
                serverRes.pipe(res);
            }

            if (serverOpts.protocol == "http") {
                http.get(options, serverRes);
                // http[method](
                //     options,
                //     serverRes
                // );
            }
            if (serverOpts.protocol == "https") {
                // https[method](
                //     options,
                //     serverRes
                // );
            }
        });
    }
}