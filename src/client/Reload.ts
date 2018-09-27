import * as decision from "dt-decisions";

export function run(socket: any) {
    socket.on("events", (data: string) => {
        console.log("Server Event:", data);
    });

    socket.on("browser command", (data: string) => {
        decision({
            reload: () => document.location.reload(),
        })(data);
    });

}
