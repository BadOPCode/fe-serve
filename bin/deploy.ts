import {Deploy} from "./build";
import * as shell from "shelljs";

Deploy();
shell.exec("nyc alsatian tests/**/*.spec.js");