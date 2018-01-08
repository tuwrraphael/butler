import { WebhookRequest } from "../models/WebhookRequest"
import * as https from "https";

const INTERVAL = 60000 * 15;
const GAP = 100;

export class WebhookService {

    private webhooks: WebhookRequest[];

    constructor() {
        this.webhooks = [];
        setInterval(this.invoke.bind(this), INTERVAL);
    }

    public install(req: WebhookRequest) {
        this.webhooks.push(req);
        var dueTime = req.dueTime();
        this.shedule(dueTime);
    }

    private shedule(dueTime: number) {
        if (dueTime <= 0) {
            this.invoke();
        }
        if (dueTime < 2 * INTERVAL) {
            setTimeout(this.invoke.bind(this), dueTime + GAP);
        }
    }

    private invoke() {
        var dueHooks = this.webhooks.filter(w => w.isDue());
        dueHooks.forEach(w => {
            var postData = JSON.stringify(w.data);
            var req = https.request({
                host: w.url.host,
                path: w.url.path,
                port: "443",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(postData)
                }
            }, function (res) {
                console.log(`${new Date()}: Called ${w.url.host}${w.url.path}, response status is ${res.statusCode}`);
                });
            req.write(postData);
            req.end();
            this.webhooks.splice(this.webhooks.indexOf(w),1);
        });

        var dueTimes = this.webhooks.map(w => w.dueTime()).sort();
        if (dueTimes.length) {
            this.shedule(dueTimes[0]);
        }
    }
}