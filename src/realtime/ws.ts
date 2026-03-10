import WebSocket, { WebSocketServer } from "ws";
import type http from "node:http";
import { UserDatabase } from "../modules/user/user.database.js";
import ChatService from "../modules/chat/chat.service.js";
import { ChatDatabase } from "../modules/chat/chat.database.js";
import { verifyAccessToken } from "../utils/jwt.js";

type WsClient = WebSocket & {
    user?: { userId: string; email: string; role: "customer" | "admin" };
};

type Inbound = { type: "message"; text: string }; // tin nhắn gửi từ client -> server
// Outbound: message từ server -> client

function safeJsonParse(data: unknown): any | null {
    const s =
        typeof data === "string"
            ? data
            : Buffer.isBuffer(data)
                ? data.toString("utf8")
                : null;
    return s ? JSON.parse(s) : null;
}

export function attachWsServer(server: http.Server) {
    const wss = new WebSocketServer({ server, path: "/ws" });

    const userDb = new UserDatabase();
    const chatService = new ChatService(new ChatDatabase());

    const broadCast = (obj: unknown) => {
        const payload = JSON.stringify(obj);
        for (const c of wss.clients) {
            if (c.readyState === WebSocket.OPEN) c.send(payload);
        }
    };

    // Event: Connection
    wss.on("connection", async (ws: WsClient, req) => {
        const url = new URL(req.url ?? "", `http://${req.headers.host}`);
        const token = url.searchParams.get("token");
        // http://localhost:9999/api/chat/messages?token=<ACCESS_TOKEN>
        if (!token) return ws.close(1008, "Missing Token");

        let jwt: { sub: string; role: "customer" | "admin" };

        jwt = verifyAccessToken(token);
        const user = await userDb.findById(jwt.sub);
        if (!user) {
            return ws.close(1008, "User not found");
        }
        ws.user = {
            userId: user?._id.toString(),
            email: user?.email,
            role: user?.role,
        };

        // Event: Message
        ws.on("message", async (raw) => {
            const msg = safeJsonParse(raw) as Inbound | null;
            if (!ws.user) return;
            if (!msg) return;

            const saved = await chatService.postMessage({
                userId: ws.user?.userId,
                userEmail: ws.user?.email,
                role: ws.user?.role,
                text: msg?.text,
            });

            broadCast({
                type: "message",
                data: {
                    id: saved._id.toString(),
                    userEmail: saved.userEmail,
                    role: saved.role,
                    text: saved.text,
                    createdAt: saved.createdAt,
                },
            });
        });
    });
}