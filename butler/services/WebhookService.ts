
import { WebhookRequest, IPersistableWebhookRequest } from "../models/WebhookRequest"
import * as fs from "fs";
import * as https from "https";

const INTERVAL = 60000 * 2;
const GAP = 100;
const FILE_NAME = "schedule.json";

export class WebhookService {

    private webhooks: WebhookRequest[];

    constructor() {
        this.webhooks = [];
        var self = this;
        if (fs.existsSync(FILE_NAME)) {
            var persisted = <IPersistableWebhookRequest[]>JSON.parse(fs.readFileSync(FILE_NAME, "utf8"));
            persisted.forEach(v => {
                var r = new WebhookRequest(null, null, null);
                r.fromPersisted(v);
                self.installHook(r);
            });
        }
        setInterval(this.invoke.bind(this), INTERVAL);
    }

    private installHook(req: WebhookRequest) {
        this.webhooks.push(req);
        var dueTime = req.dueTime();
        this.shedule(dueTime);
        console.log(`${new Date()}: Scheduled ${req.url} at ${req.when}`);
    }

    private persistHooks() {
        try {
            var persisted = this.webhooks.map(v => v.getPersistable());
            fs.writeFileSync(FILE_NAME, JSON.stringify(persisted), "utf8");
        }
        catch{
            console.error("Could not store schedule");
        }
    }

    public install(req: WebhookRequest) {
        this.installHook(req);
        this.persistHooks();
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
            var start = new Date();
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
                console.log(`${start} until ${new Date()} (sheduled: ${w.when}): Called ${w.url.host}${w.url.path}, response status is ${res.statusCode}`);
            });
            req.write(postData);
            req.end();
            this.webhooks.splice(this.webhooks.indexOf(w), 1);
        });

        var dueTimes = this.webhooks.map(w => w.dueTime()).sort();
        if (dueTimes.length) {
            this.shedule(dueTimes[0]);
        }
        this.persistHooks();
    }
}
