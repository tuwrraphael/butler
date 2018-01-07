import { Request, Response, NextFunction } from 'express';
import { WebhookRequest } from "../models/WebhookRequest";
import * as url from "url";
import { WebhookService } from "../services/WebhookService";

export class WebhookController {

    constructor(private webhookService: WebhookService) {

    }

    public post(req: Request, res: Response, next: NextFunction) {
        if (typeof req.body.url != "string" || typeof req.body.when != "string") {
            res.statusCode = 400;
            res.send("url and when must be supplied");
            return;
        }
        var hookUrl = url.parse(req.body.url);
        if (!hookUrl.path || !hookUrl.host || !hookUrl.protocol) {
            res.statusCode = 400;
            res.send("url malformatted");
            return;
        }
        if (hookUrl.protocol != "https:") {
            res.statusCode = 400;
            res.send("only https url supported");
            return;
        }
        var date = Date.parse(req.body.when);
        if (isNaN(date)) {
            res.statusCode = 400;
            res.send("date malformatted");
            return;
        }
        var webhookRequest = new WebhookRequest(req.body.data, hookUrl, new Date(date));
        this.webhookService.install(webhookRequest);
        res.statusCode = 200;
        res.send("webhook created");
    }
}