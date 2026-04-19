import { create } from 'zustand';
import { ChatRoom, ChatMessage } from './types';

interface ChatState {
    rooms: ChatRoom[];
    activeRoomId: number | null;
    messages: ChatMessage[];
    isLoadingRooms: boolean;
    isSending: boolean;

    setRooms: (rooms: ChatRoom[]) => void;
    addRoom: (room: ChatRoom) => void;
    setActiveRoom: (id: number | null) => void;
    setMessages: (messages: ChatMessage[]) => void;
    appendMessage: (msg: ChatMessage) => void;
    setLoadingRooms: (v: boolean) => void;
    setSending: (v: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    rooms: [],
    activeRoomId: null,
    messages: [],
    isLoadingRooms: false,
    isSending: false,

    setRooms: (rooms) => set({ rooms }),
    addRoom: (room) => set((s) => ({ rooms: [room, ...s.rooms] })),
    setActiveRoom: (id) => set({ activeRoomId: id, messages: [] }),
    setMessages: (messages) => set({ messages }),
    appendMessage: (msg) =>
        set((s) => {
            if (s.messages.some((m) => m.id === msg.id)) return s;
            return { messages: [...s.messages, msg] };
        }),
    setLoadingRooms: (v) => set({ isLoadingRooms: v }),
    setSending: (v) => set({ isSending: v }),
}));
