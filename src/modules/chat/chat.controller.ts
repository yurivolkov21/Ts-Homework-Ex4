import type { Request, Response } from "express";
import type ChatService from "./chat.service.js";
import { create } from "domain";

export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    // localhost:9999/api/chat/messages?limit=50&before=<time>
    listMessages = async (req: Request, res: Response) => {
        const messages = await this.chatService.listHistory(req.query as any);
        res.json(
            messages.map((m) => ({
                id: m._id.toString(),
                userEmail: m.userEmail,
                role: m.role,
                text: m.text,
                createdAt: m.createdAt,
            })),
        );
    };
}