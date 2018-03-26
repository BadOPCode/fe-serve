import { Config, IConfigData } from "./Config";
import { WebServer } from "./Web";

const config = new Config();
// need to add parameter to readPackage if specified.
config.readPackage();

const web  = new WebServer();
web.processConfig(config);
config.addListener((newConfig: IConfigData) => {
    web.processConfig(newConfig);
});
