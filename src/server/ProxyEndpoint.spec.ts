import { Expect, Setup, SetupFixture, SpyOn, Test, TestFixture, Teardown, TeardownFixture } from "alsatian";
import rewiremock from "rewiremock";

rewiremock.enable();
rewiremock('http')
    .with({
        request: (options:any, callback:(res:any)=>void) => {
            callback({
                header: "header",
                pipe: () => {},
                statusCode: 200
            })
            return {
                end: () => {}
            }
        }
    });
rewiremock('https')
    .with({
        request: (options:any, callback:(res:any)=>void) => {
            callback({
                header: "header",
                pipe: () => {},
                statusCode: 200
            })
            return {
                end: () => {}
            }
        }
    });
import * as ProxyEndpointSpec from "./ProxyEndpoint";

let dummySharePath: string = "";
const fakeServer = {
    all: (sharePath: string, callback: (req:any, res:any)=>void )=>{
        dummySharePath = sharePath;
        callback(
            {
                method: "GET",
                url: "/proxy/test",
                end: ()=>{}
            },
            {
                writeHead: () =>{},
                pipe: () => {}
            }
        );
    }
}

@TestFixture("ProxyEndpoint Class")
export class ProxyEndpointTestFixture {
    public proxyEP: ProxyEndpointSpec.ProxyEndpoint;

    @SetupFixture
    public setupFixture() {
        this.proxyEP = new ProxyEndpointSpec.ProxyEndpoint(fakeServer);
    }

    @Test("Test constructor")
    public testInit() {
        Expect(this.proxyEP).toBeDefined();
    }

    @Test("Test addProxyRoute")
    public testAddProxyRoute() {
        this.proxyEP.addProxyRoute("/proxy", {
            hostname: "test.com",
            protocol: "http"
        });

        Expect(dummySharePath).toBe("/proxy");
    }
}