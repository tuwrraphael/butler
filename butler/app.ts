import { Config } from "./config";
import { Server } from "./server";

var server = Server.bootstrap();
server.app.listen(Config.port);

console.log(`butler service started on port ${Config.port}`);