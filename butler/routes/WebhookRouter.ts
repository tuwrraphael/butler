import { Router } from 'express';
import { WebhookController } from "../controllers/WebhookController";
import { WebhookService } from "../services/WebhookService";

export class WebhookRouter {
    router: Router;
    controller: WebhookController;

    constructor(private webhookService: WebhookService) {
        this.router = Router();
        this.controller = new WebhookController(webhookService);
        this.init();
    }

    init() {
        this.router.post('/', this.controller.post.bind(this.controller));
    }

}