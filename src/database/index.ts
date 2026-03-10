import { getDb } from "./mongo.js";

export async function ensureIndex(): Promise<void> {
    const db = getDb();

    // User: unique index on email for authentication and lookup
    await db
        .collection("users")
        .createIndex({ email: 1 }, { unique: true });

    // Product: text index for title and description to support search functionality
    await db
        .collection("products")
        .createIndex(
            { title: "text", description: "text" },
            { name: "products_text_search" }
        );

    // Refresh token: compound index for userId, revokeAt, expiresAt
    await db
        .collection("refresh_tokens")
        .createIndex(
            { userId: 1, revokeAt: 1, expiresAt: 1 },
            { name: "refresh_tokens_user_active" }
        );

    // Placeholder for future chat functionality: compound index to support per-chat timeline queries
    await db
        .collection("chat_messages")
        .createIndex(
            { chatId: 1, createdAt: -1 },
            { name: "chat_messages_timeline" }
        );
}