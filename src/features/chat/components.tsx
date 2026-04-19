'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    MessageCircle, Send, ArrowLeft, Loader2, AlertCircle,
    MessageSquare, Plus, X, Search,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';
import { useChatStore } from './store';
import {
    fetchRooms, fetchMessages, sendMessage, subscribeToMessages,
    formatChatTime, getOrCreateRoom, findUserByNickname,
} from './logic';
import { ChatRoom } from './types';
import type { RealtimeChannel } from '@supabase/supabase-js';

/* ─────────────────────────────────────────────────
   진입점
───────────────────────────────────────────────── */
export const ChatContent = () => {
    const { user, openModal } = useAuthStore();

    if (!user) {
        return (
            <div className="max-w-3xl mx-auto w-full">
                <div className="bg-card border border-border rounded-2xl shadow-card flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center">
                        <MessageCircle className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-center">
                        <p className="text-base font-bold text-foreground">채팅을 이용하려면 로그인이 필요합니다</p>
                        <p className="text-sm text-foreground-muted mt-1">로그인 후 1:1 대화를 시작하세요</p>
                    </div>
                    <button
                        onClick={() => openModal('login')}
                        className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors shadow-sm"
                    >
                        로그인 하기
                    </button>
                </div>
            </div>
        );
    }

    return <ChatLayout userId={user.id} />;
};

/* ─────────────────────────────────────────────────
   메인 레이아웃 (사이드바 + 메시지뷰)
───────────────────────────────────────────────── */
const ChatLayout = ({ userId }: { userId: string }) => {
    const { rooms, activeRoomId, setRooms, setActiveRoom, addRoom, setLoadingRooms, isLoadingRooms } = useChatStore();
    const [error, setError] = useState('');
    const [mobileView, setMobileView] = useState<'list' | 'room'>('list');
    const [showNewChat, setShowNewChat] = useState(false);

    useEffect(() => {
        setLoadingRooms(true);
        fetchRooms(userId)
            .then(setRooms)
            .catch((e) => setError(e.message))
            .finally(() => setLoadingRooms(false));
    }, [userId]);

    const handleSelectRoom = (id: number) => {
        setActiveRoom(id);
        setMobileView('room');
    };

    const handleNewRoom = async (otherId: string, otherNickname: string) => {
        try {
            const roomId = await getOrCreateRoom(userId, otherId);
            const exists = rooms.find((r) => r.id === roomId);
            if (!exists) {
                const newRoom: ChatRoom = {
                    id: roomId,
                    buyer_id: userId,
                    seller_id: otherId,
                    created_at: new Date().toISOString(),
                    other_id: otherId,
                    other_nickname: otherNickname,
                };
                addRoom(newRoom);
            }
            setActiveRoom(roomId);
            setMobileView('room');
        } catch {
            // handled in modal
        }
    };

    const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;

    return (
        <div className="max-w-5xl mx-auto w-full animate-fade-in">
            {/* 헤더 */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-extrabold text-foreground">채팅</h1>
                    <p className="text-xs text-foreground-muted mt-0.5">1:1 메시지</p>
                </div>
            </div>

            <div
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-card"
                style={{ height: '600px' }}
            >
                <div className="flex h-full">
                    {/* 채팅방 목록 */}
                    <div
                        className={`${mobileView === 'room' ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-72 border-r border-border shrink-0`}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background-secondary shrink-0">
                            <p className="text-sm font-bold text-foreground">대화 목록</p>
                            <button
                                onClick={() => setShowNewChat(true)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
                                title="새 대화 시작"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {isLoadingRooms ? (
                            <div className="flex-1 flex items-center justify-center gap-2 text-foreground-muted">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">불러오는 중...</span>
                            </div>
                        ) : error ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-red-500 px-4 text-center">
                                <AlertCircle className="w-6 h-6" />
                                <span className="text-sm">{error}</span>
                            </div>
                        ) : rooms.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-foreground-muted px-5 text-center">
                                <MessageSquare className="w-9 h-9 opacity-20" />
                                <p className="text-sm font-medium">진행 중인 대화가 없습니다</p>
                                <button
                                    onClick={() => setShowNewChat(true)}
                                    className="text-xs text-primary font-semibold hover:underline"
                                >
                                    새 대화 시작하기
                                </button>
                            </div>
                        ) : (
                            <ul className="flex-1 overflow-y-auto divide-y divide-border">
                                {rooms.map((room) => (
                                    <RoomItem
                                        key={room.id}
                                        room={room}
                                        isActive={room.id === activeRoomId}
                                        onClick={() => handleSelectRoom(room.id)}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* 메시지 뷰 */}
                    <div
                        className={`${mobileView === 'list' ? 'hidden' : 'flex'} md:flex flex-1 flex-col min-w-0`}
                    >
                        {activeRoomId === null || activeRoom === null ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-foreground-muted">
                                <MessageCircle className="w-10 h-10 opacity-20" />
                                <p className="text-sm">대화를 선택하거나 새로 시작하세요</p>
                            </div>
                        ) : (
                            <MessageView
                                key={activeRoomId}
                                roomId={activeRoomId}
                                userId={userId}
                                otherNickname={activeRoom.other_nickname}
                                onBack={() => {
                                    setMobileView('list');
                                    setActiveRoom(null);
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {showNewChat && (
                <NewChatModal
                    currentUserId={userId}
                    onClose={() => setShowNewChat(false)}
                    onStart={handleNewRoom}
                />
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────
   채팅방 목록 아이템
───────────────────────────────────────────────── */
const RoomItem = ({
    room,
    isActive,
    onClick,
}: {
    room: ChatRoom;
    isActive: boolean;
    onClick: () => void;
}) => (
    <li
        onClick={onClick}
        className={`px-4 py-3.5 cursor-pointer hover:bg-background-secondary transition-colors flex items-center gap-3 ${
            isActive ? 'bg-primary-light border-l-2 border-primary' : ''
        }`}
    >
        <div className="w-10 h-10 rounded-full bg-primary-light border border-primary/20 flex items-center justify-center text-sm font-extrabold text-primary shrink-0">
            {(room.other_nickname ?? '?')[0].toUpperCase()}
        </div>
        <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{room.other_nickname}</p>
            <p className="text-xs text-foreground-muted">{formatChatTime(room.created_at)}</p>
        </div>
    </li>
);

/* ─────────────────────────────────────────────────
   메시지 뷰
───────────────────────────────────────────────── */
const MessageView = ({
    roomId,
    userId,
    otherNickname,
    onBack,
}: {
    roomId: number;
    userId: string;
    otherNickname: string;
    onBack: () => void;
}) => {
    const { messages, setMessages, appendMessage, isSending, setSending } = useChatStore();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    const stableAppend = useCallback(appendMessage, []);

    useEffect(() => {
        setLoading(true);
        fetchMessages(roomId)
            .then(setMessages)
            .finally(() => setLoading(false));

        channelRef.current = subscribeToMessages(roomId, stableAppend);
        return () => { channelRef.current?.unsubscribe(); };
    }, [roomId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isSending) return;
        setInput('');
        setSending(true);
        try {
            await sendMessage(roomId, userId, text);
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            {/* 헤더 */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background-secondary shrink-0">
                <button
                    onClick={onBack}
                    className="md:hidden p-1.5 rounded-lg text-foreground-muted hover:text-primary hover:bg-primary-light transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-xs font-extrabold text-primary">
                    {otherNickname[0].toUpperCase()}
                </div>
                <p className="text-sm font-bold text-foreground">{otherNickname}</p>
            </div>

            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center gap-2 text-foreground-muted">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">불러오는 중...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-foreground-muted">
                        <MessageCircle className="w-8 h-8 opacity-20" />
                        <p className="text-sm">첫 메시지를 보내보세요</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMine = msg.sender_id === userId;
                        return (
                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[72%] flex flex-col gap-0.5 ${isMine ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`px-4 py-2.5 text-sm leading-relaxed break-words ${
                                            isMine
                                                ? 'bg-primary text-white rounded-2xl rounded-br-sm'
                                                : 'bg-background-secondary text-foreground border border-border rounded-2xl rounded-bl-sm'
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-foreground-muted px-1">
                                        {formatChatTime(msg.created_at)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* 입력창 */}
            <div className="px-4 py-3 border-t border-border bg-background-secondary flex gap-2 items-end shrink-0">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
                    rows={1}
                    className="flex-1 resize-none bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isSending}
                    className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                    {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </button>
            </div>
        </>
    );
};

/* ─────────────────────────────────────────────────
   새 대화 시작 모달
───────────────────────────────────────────────── */
const NewChatModal = ({
    currentUserId,
    onClose,
    onStart,
}: {
    currentUserId: string;
    onClose: () => void;
    onStart: (otherId: string, otherNickname: string) => Promise<void>;
}) => {
    const [nickname, setNickname] = useState('');
    const [searching, setSearching] = useState(false);
    const [starting, setStarting] = useState(false);
    const [found, setFound] = useState<{ id: string; nickname: string } | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!nickname.trim()) return;
        setSearching(true);
        setFound(null);
        setNotFound(false);
        setError('');
        const result = await findUserByNickname(nickname.trim());
        if (result) {
            if (result.id === currentUserId) {
                setError('자기 자신에게는 메시지를 보낼 수 없습니다.');
            } else {
                setFound(result);
            }
        } else {
            setNotFound(true);
        }
        setSearching(false);
    };

    const handleStart = async () => {
        if (!found) return;
        setStarting(true);
        try {
            await onStart(found.id, found.nickname);
            onClose();
        } catch {
            setError('대화를 시작하는 중 오류가 발생했습니다.');
        } finally {
            setStarting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-card-lg animate-slide-up z-10">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-1.5 rounded-full text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-base font-extrabold text-foreground">새 대화 시작</h3>
                        <p className="text-xs text-foreground-muted">닉네임으로 사용자 검색</p>
                    </div>
                </div>

                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => { setNickname(e.target.value); setFound(null); setNotFound(false); setError(''); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        placeholder="닉네임 입력"
                        className="flex-1 bg-background-secondary border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={!nickname.trim() || searching}
                        className="px-3.5 flex items-center justify-center rounded-xl bg-primary-light text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-40 border border-primary/20"
                    >
                        {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </button>
                </div>

                {error && (
                    <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {error}
                    </p>
                )}

                {notFound && !error && (
                    <p className="text-xs text-foreground-muted mb-3">해당 닉네임의 사용자를 찾을 수 없습니다.</p>
                )}

                {found && (
                    <div className="flex items-center justify-between bg-primary-light border border-primary/20 rounded-xl px-4 py-3 mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-extrabold text-white">
                                {found.nickname[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-foreground">{found.nickname}</span>
                        </div>
                        <button
                            onClick={handleStart}
                            disabled={starting}
                            className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors disabled:opacity-40 flex items-center gap-1"
                        >
                            {starting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            대화 시작
                        </button>
                    </div>
                )}

                <p className="text-xs text-foreground-muted text-center">
                    상대방의 정확한 닉네임을 입력하세요
                </p>
            </div>
        </div>
    );
};
