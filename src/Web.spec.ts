import { Expect, Setup, SetupFixture, SpyOn, Test, TestFixture, Teardown, TeardownFixture } from "alsatian";
import * as fs from "fs";
import * as https from "https";
import { IConfigData, Symbols } from "./Config";
import { FakeIO } from "./mocks/socket.io.mock";
import rewiremock, { plugins } from "rewiremock";
import * as SocketIO from "socket.io";

var sockPuppet:FakeIO = new FakeIO(); 

rewiremock.addPlugin(plugins.nodejs);
rewiremock.enable();
rewiremock('socket.io')
    .with(()=>{
        return sockPuppet;
    });
import * as WebSpec from "./Web";

// const rewiremock = require("rewiremock").default;
 
const mockGoodConfig: IConfigData = {
    defaultApiAddress: "api.test.com",
    listenPort: 8675309,
    pathMaps: {
        "/mock": {
            mockFile: "mock.json",
            sharePath: "/mock",
            type: "mock",
        },
        "/proxy": {
            serverPath: "api.proxy.com",
            sharePath: "/proxy",
            type: "proxy",
        },
        "/static": {
            localPath: "tests",
            sharePath: "/static",
            type: "static",
        },
    },
};

@TestFixture("Web Class")
export class WebTestFixture {
    public web: WebSpec.WebServer;
    @SetupFixture
    public setupFixture() {
        // SpyOn(socketio, "Server").andReturn({

        // });
    }
 
    @TeardownFixture
    public teardownTest() {
        rewiremock.disable();
    }

    @Setup
    public setupTest() {
        // rewiremock.proxy('socket.io', new FakeIO());

        // reinitialize web server every test because a couple of test we stub it
        this.web = new WebSpec.WebServer();
    }
    
    @Test("Check to see if the constructor is working.")
    public testInit() {
        Expect(this.web).toBeDefined();
    }

    @Test("Test processConfig to see if it can map a config object")
    public testProcessConfig() {
        // stub all the calling functions to isolate processConfig
        SpyOn(this.web, "mapMock").andCall((...args: any[]) => {
            Expect(args[0].type).toBe("mock");
            Expect(args[0].sharePath).toBe("/mock");
            Expect(args[0].mockFile).toBe("mock.json");
        });
        SpyOn(this.web, "mapProxy").andCall((...args: any[]) => {
            Expect(args[0].type).toBe("proxy");
            Expect(args[0].sharePath).toBe("/proxy");
            Expect(args[0].serverPath).toBe("api.proxy.com");
        });
        SpyOn(this.web, "mapStatic").andCall((...args: any[]) => {
            Expect(args[0].type).toBe("static");
            Expect(args[0].sharePath).toBe("/static");
            Expect(args[0].localPath).toBe("tests");
        });
        SpyOn(this.web, "setPort").andCall((...args: any[]) => {
            Expect(args[0]).toBe(8675309);
        });
        this.web.processConfig(mockGoodConfig);
    }

    @Test("addWebSocket()")
    public testAddWebSocket() {
        this.web.queue = [];
        this.web.addWebSocket();
        sockPuppet.$runCallback();
        Expect(this.web.queue.length).toBe(1);
    }

    @Test("writeToQueue()")
    public testWriteToQueue() {
        const emitSpy = SpyOn(this.web.io, "emit");
        this.web.writeToQueue("test", {"test":42});
        Expect(emitSpy).toHaveBeenCalled();
    }

    @Test("Test mapMock to see if it maps")
    public testMapMock() {
        SpyOn(fs, "createReadStream").andCall((...args: any[]) => {
            return {
                pipe: (res: string) => {
                    Expect(res).toBe("res");
                },
            };
        });

        // make mock for Express.all
        SpyOn(this.web.app, "all").andCall((...args: any[]) => {
            Expect(args[0]).toBe("/mock");
            Expect(args[1]).toBeDefined();
            // called with fake parameters
            args[1]("req", "res");
        });

        // make mock for node fs access
        SpyOn(fs, "access").andCall((...args: any[]) => {
            Expect(args[0]).toBe("mock.json");
            Expect(args[2]).toBeDefined();
            args[2]();
        });

        this.web.mapMock({
            mockFile: "mock.json",
            sharePath: "/mock",
            type: "mock",
        });
    }

    @Test("Test mapProxy to see if it correctly adds a route")
    public testMapProxy() {
        // make mock for https.get
        SpyOn(https, "get").andCall((...args: any[]) => {
            Expect(args[0].hostname).toBe("api.proxy.com");
            Expect(args[0].path).toBe("/path");

            args[1]({
                headers: "headers",
                pipe: (localRes: any) => {
                    Expect(localRes.isLocalRes).toBe(true);
                },
                statusCode: 200,
            });
        });

        // make mock for Express.all
        SpyOn(this.web.app, "all").andCall((...args: any[]) => {
            Expect(args[0]).toBe("/proxy");
            Expect(args[1]).toBeDefined();
            const req = {
                method: "GET",
                path: "/path",
            };
            const res = {
                isLocalRes: true,
                pipe: (serverRes: any) => {
                    Expect(serverRes.statusCode).toBe(200);
                    Expect(serverRes.headers).toBe("headers");
                },
                writeHead: (statusCode: number, headers: string) => {
                    Expect(statusCode).toBe(200);
                    Expect(headers).toBe("headers");
                },
            };
            // called with fake parameters
            args[1](req, res);
        });

        this.web.mapProxy({
            serverPath: "api.proxy.com",
            sharePath: "/proxy",
            type: "proxy",
        });
    }

    @Test("Test the static mapping")
    public testMapStatic() {
        rewiremock('./pluginExpressStatic').with({
            static: (options:any) => {
                Expect(options.serverPath).toBe("proxy")                
            }
        })

        SpyOn(this.web.app, "use").andCall((...args: any[]) => {
            // Expect(args[0]).toBe("/proxy");
        });
        this.web.mapStatic({
            localPath: "/local",
            sharePath: "/proxy",
            type: "proxy",
        });
    }

    @Test("If static map does not specify a local path a error should be handled")
    public testMapStaticMissingLocalPath() {
        try {
            this.web.mapStatic({
                sharePath: "/proxy",
                type: "proxy",
            });
        } catch (e) {
            Expect(e.message).toBe(Symbols.MISSING_LOCALPATH);
        }
    }

    @Test("Test to see if unmap is clearing route stack as of Express 4.x")
    public testUnmap() {
        // in express 4.x this would normally be a list of route objects
        this.web.app = {
            _router: {
                stack: [ 1, 2, 3 ],
            },
        };
        this.web.unmap();
        Expect(this.web.app._router.stack.length).toBe(0);
    }

    @Test("This tests the closeServer() method")
    public testCloseServer() {
        this.web.server = {
            close: () => {
                const x = 1;
            },
        };
        const closeSpy = SpyOn(this.web.server, "close");
        this.web.closeServer();
        Expect(closeSpy).toHaveBeenCalled();
    }

    @Test("Test setPort to see if it starts listener")
    public testSetPort() {
        SpyOn(this.web.app, "listen").andCall((...args: any[]) => {
            Expect(args[0]).toBe(1234);
            args[1]();
            this.web.isListening = true;
        });
    }

    @Test("if setPort closes if already listening")
    public testSetPortClose() {
        const closeServer = SpyOn(this.web, "closeServer");
        //closeServer.andCallThrough();
        this.web.isListening = false;
        this.web.setPort(1234);
        Expect(closeServer).not.toHaveBeenCalled();

        this.web.isListening = true;
        this.web.setPort(1234);
        Expect(closeServer).toHaveBeenCalled();
    }
}
