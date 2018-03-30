import { Expect, SetupFixture, SpyOn, Test, TestFixture } from "alsatian";
import * as fs from "fs";
import * as path from "path";
import * as ConfigSpec from "./Config";

@TestFixture("Config class")
export class ConfigTestFixture {
    public config: ConfigSpec.Config;

    @SetupFixture
    public setupFixture() {
        this.config = new ConfigSpec.Config();
    }

    @Test("Confirm Config class is defined.")
    public configDefined() {
        Expect(ConfigSpec.Config).toBeDefined();
    }

    @Test("addListener should push to the stack")
    public testAddListener() {
        this.config.addListener((configData) => {
            Expect(configData.listenPort).toBe(9000);
        });
        this.config.readPackage();
    }

    @Test("readPackage should generate a config object")
    public testReadPackage() {
        SpyOn(fs, "readFileSync").andCall(() => {
            return JSON.stringify({
                "fullstack-serve": {
                    listenPort: 9000,
                },
            });
        });
        SpyOn(fs, "access").andCall((...args: any[]) => {
            Expect(args[0]).toBe(path.join("poop", "package.json"));
            Expect(args[1]).toBe(4);
            args[2]();
        });
        this.config.readPackage("poop");
        Expect(fs.access).toHaveBeenCalled();
    }

    @Test("readPackage should stop on file not readable")
    public testReadPackageReadError() {
        SpyOn(fs, "access").andCall((...args: any[]) => {
            Expect(args[0]).toBe(path.join(".", "package.json"));
            Expect(args[1]).toBe(4);
            try {
                args[2]("error happened");
            } catch (e) {
                Expect(e.message).toBe(ConfigSpec.Symbols.READ_ERROR);
            }
        });
        this.config.readPackage();
        Expect(fs.access).toHaveBeenCalled();
    }

    @Test("readPackage should return an error if fullstack-serve is missing")
    public testReadPackageMissingConfig() {
        SpyOn(fs, "readFileSync").andCall(() => {
            return JSON.stringify({
            });
        });
        SpyOn(fs, "access").andCall((...args: any[]) => {
            Expect(args[0]).toBe(path.join("poop", "package.json"));
            Expect(args[1]).toBe(4);
            try {
                args[2]();
            } catch (e) {
                Expect(e.message).toBe(ConfigSpec.Symbols.MISSING_CONFIG);
            }
        });
        this.config.readPackage("poop");
        Expect(fs.access).toHaveBeenCalled();
    }
}
