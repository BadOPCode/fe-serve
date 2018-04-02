#!/bin/env ts-node
import * as shell from "shelljs";
import {Clean} from "./clean";
import {BuildTests} from "./build";

Clean();
BuildTests();
shell.exec("nyc alsatian tests/**/*.spec.js");