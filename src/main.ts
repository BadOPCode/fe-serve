import { Config, IConfigData } from "./Config";
import { WatchTask } from "./WatchTasks";
import { WebServer } from "./Web";

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
