import * as reload from "./Reload";

declare var io:any;
declare var document:Document;

var socket = io.connect();

reload.run(socket);