import * as bodyParser from "body-parser";
import * as express from "express";
import * as path from "path";

import { WebhookRouter } from "./routes/WebhookRouter";
import { WebhookService } from "./services/WebhookService";

export class Server {

    public app: express.Application;
    private webhookService: WebhookService;

    public static bootstrap(): Server {
        return new Server();
    }

    constructor() {
        this.app = express();
        this.webhookService = new WebhookService();
        this.config();
        this.routes();
    }

    public config() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended: false
        }));
    }

    private routes() {
        const webhookRoutes = new WebhookRouter(this.webhookService);
        webhookRoutes.init();
        this.app.use("/api/v1/webhook", webhookRoutes.router);
    }

}