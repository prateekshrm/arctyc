import {
    DBChat,
    createChat as dbCreateChat,
    deleteChat as dbDeleteChat,
    getChats as dbGetChats,
} from "@/services/chat-db";
import { create } from "zustand";

type ChatStore = {
    chats: DBChat[];
    activeChatId: string | null;
    isLoading: boolean;

    loadChats: () => Promise<void>;
    setActiveChatId: (id: string | null) => void;
    newChat: () => void;
    createChat: (id: string, title: string) => Promise<DBChat>;
    deleteChat: (id: string) => Promise<void>;
};

export const useChatStore = create<ChatStore>((set, get) => ({
    chats: [],
    activeChatId: null,
    isLoading: false,

    loadChats: async () => {
        try {
            set({ isLoading: true });
            const chats = await dbGetChats();
            set({ chats, isLoading: false });
        } catch (error) {
            console.error("Failed to load chats:", error);
            set({ isLoading: false });
        }
    },

    setActiveChatId: (id) => {
        set({ activeChatId: id });
    },

    newChat: () => {
        set({ activeChatId: null });
    },

    createChat: async (id: string, title: string) => {
        const newChat = await dbCreateChat(id, title);
        set((state) => ({
            chats: [newChat, ...state.chats],
            activeChatId: id,
        }));
        return newChat;
    },

    deleteChat: async (id: string) => {
        try {
            await dbDeleteChat(id);
            set((state) => ({
                chats: state.chats.filter((c) => c.id !== id),
                activeChatId:
                    state.activeChatId === id ? null : state.activeChatId,
            }));
        } catch (error) {
            console.error("Failed to delete chat:", error);
        }
    },
}));
