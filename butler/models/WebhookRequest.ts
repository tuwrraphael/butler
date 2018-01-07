import { Url } from "url";

export class WebhookRequest {
    constructor(public data: string, public url: Url, public when: Date) {
        
    }

    public isDue() {
        return (+this.when) <= (+new Date());
    }

    public dueTime() {
        return Math.max(0,(+this.when) - (+new Date()));
    }
}