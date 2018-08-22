#!/bin/env ts-node
import * as shell from "shelljs";

export function CleanCoverage() {
    shell.rm('-r', "coverage");
}

export function CleanLib() {
    shell.rm('-r', "lib");
}

export function CleanTests() {
    shell.rm('-r', "tests");    
}

export function Clean() {
    CleanCoverage();
    CleanLib();
    CleanTests();
}

// Clean();