import * as decision from "dt-decisions";
import { store, taskMgr } from "./Shared";
import { ITask } from "./Tasks";

export function run(socket: any) {
    socket.on("events", (data: string) => {
        console.log("Server Event:", data);
    });

    // socket.on("browser command", (data: string) => {
    //     decision({
    //         reload: () => document.location.reload(),
    //     })(data);
    // });

    socket.on("console", taskMgr.process);
}
