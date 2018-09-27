import * as reload from "./Reload";

declare var io: any;

export const socket = io.connect();

reload.run(socket);
