import * as cout from "cout";
import * as express from "express";
import * as http from "http";
import * as path from "path";
import * as SocketIO from "socket.io";

const ADMIN_PATH = path.join(__dirname, "admin");

export class WebAdminServer {
    public app: any;
    public server: any;
    public io: SocketIO.Server;
    public isListening: boolean = false;

    constructor() {
        this.app = express();
        this.server = new http.Server(this.app);
        this.io = SocketIO(this.server);
        this.initRoutes();
    }

    /**
     * closeServer(): Stops the listening thread.
     */
    public closeServer() {
        this.server.close();
        this.isListening = false;
    }

    /**
     * setPort(): Sets the listener to specified port.
     * @param listenPort number
     */
    public setPort(listenPort: number) {
        if (this.isListening) {
            this.closeServer();
        }

        this.server.listen(listenPort, () => {
            cout(`Listening on port ${listenPort}`).info();
            this.isListening = true;
        });

    }

    /**
     * Initializes the routes used by admin server.
     * @method initRoutes
     */
    protected initRoutes() {
        this.app.get(
            "/",
            (req: any, res: any) => {
                res.sendFile(
                    path.join(
                        ADMIN_PATH,
                        "html",
                        "index.html",
                    ),
                );
            },
        );

        this.app.use(
            "/html",
            express.static(
                path.join(
                    ADMIN_PATH,
                    "html",
                ),
            ),
        );

        this.app.use(
            "/js",
            express.static(
                path.join(
                    ADMIN_PATH,
                    "js",
                ),
            ),
        );
    }
}
