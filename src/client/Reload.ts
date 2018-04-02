import * as decision from "dt-decisions";

export function run(socket: any) {
    socket.on('events', (data: string) => {
        console.log(data);
    });

    socket.on("browser command", (data:string) => {
        console.log("data", data);
        decision({
            "reload": () => document.location.reload(),
        })(data);
    });
}