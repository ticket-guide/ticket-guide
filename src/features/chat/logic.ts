import { supabase } from '@/lib/supabase';
import { ChatRoom, ChatMessage } from './types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export async function fetchRooms(userId: string): Promise<ChatRoom[]> {
    const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    if (!data?.length) return [];

    const otherIds = data.map((r) => (userId === r.buyer_id ? r.seller_id : r.buyer_id));
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nickname')
        .in('id', otherIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.nickname as string]));

    return data.map((r) => {
        const otherId = userId === r.buyer_id ? r.seller_id : r.buyer_id;
        return {
            id: r.id,
            buyer_id: r.buyer_id,
            seller_id: r.seller_id,
            created_at: r.created_at,
            other_id: otherId,
            other_nickname: profileMap.get(otherId) ?? '알 수 없음',
        };
    });
}

export async function findUserByNickname(nickname: string): Promise<{ id: string; nickname: string } | null> {
    const { data } = await supabase
        .from('profiles')
        .select('id, nickname')
        .eq('nickname', nickname)
        .single();
    return data ?? null;
}

export async function getOrCreateRoom(buyerId: string, sellerId: string): Promise<number> {
    const { data: existing } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .maybeSingle();

    if (existing) return existing.id;

    const { data, error } = await supabase
        .from('chat_rooms')
        .insert({ buyer_id: buyerId, seller_id: sellerId })
        .select('id')
        .single();

    if (error) throw new Error(error.message);
    return data.id;
}

export async function fetchMessages(roomId: number): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function sendMessage(roomId: number, senderId: string, content: string): Promise<void> {
    const { error } = await supabase
        .from('chat_messages')
        .insert({ room_id: roomId, sender_id: senderId, content });

    if (error) throw new Error(error.message);
}

export function subscribeToMessages(
    roomId: number,
    onMessage: (msg: ChatMessage) => void,
): RealtimeChannel {
    return supabase
        .channel(`chat_room_${roomId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `room_id=eq.${roomId}`,
            },
            (payload) => onMessage(payload.new as ChatMessage),
        )
        .subscribe();
}

export function formatChatTime(dateStr: string): string {
    const d = new Date(dateStr);
    const isToday = d.toDateString() === new Date().toDateString();
    return isToday
        ? d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
}
