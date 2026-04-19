export interface ChatRoom {
    id: number;
    buyer_id: string;
    seller_id: string;
    created_at: string;
    other_nickname: string;
    other_id: string;
}

export interface ChatMessage {
    id: number;
    room_id: number;
    sender_id: string;
    content: string;
    created_at: string;
}
