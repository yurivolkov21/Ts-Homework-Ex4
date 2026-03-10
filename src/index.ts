import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { ensureIndex } from "./database/index.js";
import { connectMongo } from "./database/mongo.js";
import http from "node:http";
import { attachWsServer } from "./realtime/ws.js";

async function bootstrap() {
    await connectMongo();
    await ensureIndex();

    const app = createApp();

    const server = http.createServer(app);
    attachWsServer(server);

    server.listen(env.port, () => {
        console.log(`[Server Log] Listening on Port: ${env.port} (${env.nodeEnv})`);
    });
}

bootstrap().catch((err) => {
    console.error("[bootstrap] failed:", err);
    process.exit(1);
});