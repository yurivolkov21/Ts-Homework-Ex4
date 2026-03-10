import { ObjectId } from "mongodb";
import { ApiError } from "../../utils/http.js";
import type { ChatDatabase } from "./chat.database.js";

export default class ChatService {
    constructor(private readonly chatDb: ChatDatabase) { }

    async postMessage(input: {
        userId: string;
        userEmail: string;
        role: "customer" | "admin";
        text: string;
    }) {
        const text = (input.text ?? "").trim();

        if (!text) {
            throw new ApiError(400, { message: "Message text is required" });
        }
        if (text.length > 2000) {
            throw new ApiError(400, {
                message: "Message text is too long (> 200 characters)",
            });
        }

        const now = new Date();

        return this.chatDb.insert({
            userId: new ObjectId(input.userId),
            userEmail: input.userEmail,
            role: input.role,
            text,
            createdAt: now,
        });
    }

    async listHistory(input: { limit?: string; before?: string }) {
        const limit = Number(this.parsePositiveInt(input.limit, 50, 200));
        let beforeDate: Date | undefined;

        if (input.before) {
            const d = new Date(input.before);
            if (Number.isNaN(d.getTime())) {
                throw new ApiError(400, { message: "Invalid before ISO date" });
            }
            beforeDate = d;
        }

        return this.chatDb.list({ before: beforeDate, limit });
    }
    // => limit(500,50,200) => limit(200)
    // => limit("one",50,200) => limit(50)
    async parsePositiveInt(v: string | undefined, fallback: number, max: number) {
        if (!v) return fallback;
        const n = Number(v);
        if (!Number.isInteger(n) || n <= 0) return fallback;
        return Math.min(n, max);
    }
}