import * as cout from "cout";
import { Config, IConfigData } from "./Config";
import { WatchTask } from "./WatchTasks";
import { WebServer } from "./Web";
import { WebAdminServer } from "./WebAdmin";

const bootstrap = () => {
    const config = new Config();
    // need to add parameter to readPackage if specified.
    config.readPackage();

    const web  = new WebServer();
    const adminServer = new WebAdminServer();
    const watch = new WatchTask(adminServer);

    adminServer.setPort(5000);

    config.addListener((eventType: string) => {
        if (eventType === "loaded") {
            web.processConfig(config);
            watch.processConfig(config);
        }
        if (eventType === "reload") {
            web.writeToQueue("browser command", "reload");
            process.exit(42);
        }
    });

    process.on("uncaughtException", (err) => {
        cout(`Uncaught exception occurred: ${err}`).error();
        web.writeToQueue("events", err);
    });
};

process.on("SIGINT", (signal) => {
    cout(`closing server...`).error;
    process.exit(1);
});

bootstrap();
