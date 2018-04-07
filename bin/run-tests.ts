#!/bin/env ts-node
import * as shell from "shelljs";
import {CleanTests} from "./clean";
import {BuildTests} from "./build";

CleanTests();
BuildTests();
shell.exec("nyc alsatian tests/**/*.spec.js");