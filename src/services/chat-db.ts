import * as SQLite from "expo-sqlite";

export type DBChat = {
    id: string;
    title: string;
    created_at: number;
    updated_at: number;
};

export type DBMessage = {
    id: string;
    chat_id: string;
    role: "user" | "assistant";
    content: string;
    created_at: number;
};

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDatabase = (): SQLite.SQLiteDatabase => {
    if (!dbInstance) {
        dbInstance = SQLite.openDatabaseSync("arctyc.db");
        dbInstance.execSync(`
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS chats (
                id TEXT PRIMARY KEY NOT NULL,
                title TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY NOT NULL,
                chat_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE
            );
        `);
    }
    return dbInstance;
};

export const getChats = async (): Promise<DBChat[]> => {
    const db = getDatabase();
    return await db.getAllAsync<DBChat>(
        "SELECT * FROM chats ORDER BY updated_at DESC",
    );
};

export const createChat = async (
    id: string,
    title: string,
): Promise<DBChat> => {
    const db = getDatabase();
    const now = Date.now();
    await db.runAsync(
        "INSERT INTO chats (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
        [id, title, now, now],
    );
    return {
        id,
        title,
        created_at: now,
        updated_at: now,
    };
};

export const deleteChat = async (id: string): Promise<void> => {
    const db = getDatabase();
    await db.runAsync("DELETE FROM messages WHERE chat_id = ?", [id]);
    await db.runAsync("DELETE FROM chats WHERE id = ?", [id]);
};

export const getMessages = async (chatId: string): Promise<DBMessage[]> => {
    const db = getDatabase();
    return await db.getAllAsync<DBMessage>(
        "SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC",
        [chatId],
    );
};

export const saveMessage = async (
    chatId: string,
    message: {
        id: string;
        role: "user" | "assistant";
        content: string;
        createdAt?: number;
    },
): Promise<void> => {
    const db = getDatabase();
    const now = message.createdAt ?? Date.now();

    await db.runAsync(
        `INSERT INTO messages (id, chat_id, role, content, created_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET content = excluded.content`,
        [message.id, chatId, message.role, message.content, now],
    );

    // Update parent chat's updated_at
    await db.runAsync("UPDATE chats SET updated_at = ? WHERE id = ?", [
        now,
        chatId,
    ]);
};

export const updateMessageContent = async (
    id: string,
    content: string,
): Promise<void> => {
    const db = getDatabase();
    await db.runAsync("UPDATE messages SET content = ? WHERE id = ?", [
        content,
        id,
    ]);
};
