import { Config, IConfigData } from "./Config";
import { WatchTask } from "./WatchTasks";
import { WebServer } from "./Web";
import * as cout from "cout";

const bootstrap = () => {
    const config = new Config();
    // need to add parameter to readPackage if specified.
    config.readPackage();

    const web  = new WebServer();
    const watch = new WatchTask();

    web.processConfig(config);
    watch.processConfig(config);
    config.addListener((newConfig: IConfigData) => {
        web.processConfig(newConfig);
        watch.processConfig(newConfig);
    });
}

const hookLoop = (code: number) => {
    if (code === 0 || code === 42) {
        bootstrap();
    } else {
        cout(`Exiting with a code ${code}`).error();
    }
}

process.on('beforeExit', hookLoop);
process.on('exit', hookLoop);
process.on('SIGINT', (signal) => {
    cout(`closing server...`).error;
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    cout(`Uncaught exception occurred: ${err}`).error();
})