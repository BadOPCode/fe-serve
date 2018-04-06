import { Expect, Setup, SetupFixture, SpyOn, Test, TestFixture } from "alsatian";
import * as shell from "shelljs";
import rewiremock from "rewiremock";
rewiremock.enable();
rewiremock('glob-watcher')
    .with((mask:string)=>{
        return {
            on: (type:string, callback:(path:string, stat:any)=>void) => {
                callback("./"+type, {
                    isBlockDevice: ()=>true,
                    isCharacterDevice: ()=>true,
                    isDirectory: ()=>true,
                    isFIFO: ()=>true,
                    isFile: ()=>true,
                    isSocket: ()=>true,
                    isSymbolicLink: ()=>true,
                });
            }
        }
    });
import * as WatchSpec from "./WatchTasks";

@TestFixture("WatchTask Class")
export class WatchTaskTestFixture {
    public watch: WatchSpec.WatchTask;

    @Setup
    public setupFixture() {
        // reinitialize web server every test because a couple of test we stub it
        this.watch = new WatchSpec.WatchTask();
    }

    @Test("Check to see if the constructor is working.")
    public testInit() {
        Expect(this.watch).toBeDefined();
    }

    @Test("Test process command to see if a valid command is passed")
    public testProcessCommand() {
        SpyOn(shell, "exec").andCall((...args: any[]) => {
            Expect(args[0]).toBe("add /test 1212 7878 5656 file 1234 3434 5678");
        });
        this.watch.processCommand("add {file} {atime} {btime} {ctime} {type} {mode} {mtime} {size}", "/test", {
            atimeMs: 1212,
            birthtimeMs: 7878,
            ctimeMs: 5656,
            isBlockDevice: () => false,
            isCharacterDevice: () => false,
            isDirectory: () => false,
            isFIFO: () => false,
            isFile: () => true,
            isSocket: () => false,
            isSymbolicLink: () => false,
            mode: 1234,
            mtimeMs: 3434,
            size: 5678,
        });
    }

    @Test("Test processConfig to see if it can successfully parse the config object.")
    public testProcessConfig() {
        SpyOn(shell, "exec").andStub();

        this.watch.processConfig({
            watchTasks: [
                {
                    masks: ["*"],
                    tasks: {
                        any: "any",
                        onAdd: "add",
                        onChange: "change",
                        onDelete: "delete",
                    },
                },
            ],
        });
    }
}
