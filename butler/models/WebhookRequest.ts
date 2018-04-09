import { Url } from "url";
import * as url from "url";

export interface IPersistableWebhookRequest {
    data: string;
    url: string;
    when: Date;
}

export class WebhookRequest {
    constructor(public data: string, public url: Url, public when: Date) {

    }

    public isDue() {
        return (this.when.getTime()) <= (new Date().getTime());
    }

    public dueTime() {
        return Math.max(0, (this.when.getTime()) - (new Date().getTime()));
    }

    public getPersistable(): IPersistableWebhookRequest {
        return {
            data: this.data,
            url: this.url.href,
            when: this.when
        };
    }

    public fromPersisted(persisted: IPersistableWebhookRequest) {
        this.data = persisted.data;
        this.url = url.parse(persisted.url);
        this.when = new Date(persisted.when);
    }
}
