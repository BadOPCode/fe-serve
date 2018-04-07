import { Expect, Setup, SetupFixture, SpyOn, createFunctionSpy, Test, TestFixture, Teardown, TeardownFixture } from "alsatian";
import * as MockEPSpec from "./MockEndpoint";
import * as fs from "fs";
import * as path from "path";

const fakeServer = {
    all: createFunctionSpy()
}

@TestFixture("MockEndpoint Class")
export class MockEndpointTestFixture {
    public mockep: MockEPSpec.MockEndpoint;

    @SetupFixture
    public setupFixture() {
        this.mockep = new MockEPSpec.MockEndpoint(fakeServer);
    }

    @Test("Ensure constructor is working")
    public testConstructor() {
        Expect(this.mockep).toBeDefined();
    }

    @Test("test addFile")
    public testAddFile() {
        SpyOn(fs, "access").andCall((...args: any[]) => {
            const testFile = path.join(__dirname, "..", "examples/TestEndpoint.js")
            Expect(args[0]).toBe(testFile);
            Expect(args[1]).toBe(4);
            args[2]();
        });
        this.mockep.addFile("/test", "examples/TestEndpoint.js");
        Expect(fakeServer.all).toHaveBeenCalled();
    }
}