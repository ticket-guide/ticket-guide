'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Pin, ChevronRight, ArrowLeft, Bell, AlertCircle, Loader2 } from 'lucide-react';
import { fetchNotices, fetchNotice, formatDate } from './logic';
import { Notice } from './types';

/* ───────────────────────────────────────────────
   공지사항 메인 (목록 ↔ 상세 전환)
─────────────────────────────────────────────── */
export const NoticesContent = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    return id ? (
        <NoticeDetail id={Number(id)} />
    ) : (
        <NoticeList />
    );
};

/* ───────────────────────────────────────────────
   목록
─────────────────────────────────────────────── */
const NoticeList = () => {
    const router = useRouter();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNotices()
            .then(setNotices)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-3xl mx-auto w-full animate-fade-in">
            {/* 헤더 */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-extrabold text-foreground">공지사항</h1>
                    <p className="text-xs text-foreground-muted mt-0.5">티켓가이드 공지 및 안내사항</p>
                </div>
            </div>

            {/* 컨텐츠 */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
                {/* 컬럼 헤더 */}
                <div className="hidden sm:grid grid-cols-[60px_1fr_120px] px-5 py-3 bg-background-secondary border-b border-border text-xs font-semibold text-foreground-muted">
                    <span>구분</span>
                    <span>제목</span>
                    <span className="text-right">날짜</span>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-16 gap-2 text-foreground-muted">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">불러오는 중...</span>
                    </div>
                )}

                {error && (
                    <div className="flex items-center justify-center py-16 gap-2 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {!loading && !error && notices.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-foreground-muted">
                        <Bell className="w-10 h-10 opacity-20 mb-3" />
                        <p className="text-sm font-medium">등록된 공지사항이 없습니다.</p>
                    </div>
                )}

                {!loading && !error && notices.length > 0 && (
                    <ul className="divide-y divide-border">
                        {notices.map((notice) => (
                            <NoticeRow
                                key={notice.id}
                                notice={notice}
                                onClick={() => router.push(`/notices?id=${notice.id}`)}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

/* ───────────────────────────────────────────────
   목록 행
─────────────────────────────────────────────── */
interface NoticeRowProps {
    notice: Notice;
    onClick: () => void;
}

const NoticeRow = ({ notice, onClick }: NoticeRowProps) => (
    <li
        onClick={onClick}
        className={`px-5 py-4 cursor-pointer hover:bg-background-secondary transition-colors group ${notice.is_pinned ? 'bg-primary-light/40' : ''}`}
    >
        {/* 모바일 */}
        <div className="sm:hidden flex flex-col gap-1">
            <div className="flex items-center gap-2">
                {notice.is_pinned ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-primary text-white">
                        <Pin className="w-3 h-3" /> 공지
                    </span>
                ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-background-secondary text-foreground-muted border border-border">
                        일반
                    </span>
                )}
                <span className="ml-auto text-xs text-foreground-muted">{formatDate(notice.created_at)}</span>
            </div>
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                {notice.title}
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
        </div>

        {/* PC */}
        <div className="hidden sm:grid grid-cols-[60px_1fr_120px] items-center gap-3">
            <div>
                {notice.is_pinned ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-primary text-white w-fit">
                        <Pin className="w-3 h-3" /> 공지
                    </span>
                ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-background-secondary text-foreground-muted border border-border w-fit block">
                        일반
                    </span>
                )}
            </div>
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1 truncate">
                {notice.title}
                <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
            <p className="text-xs text-foreground-muted text-right">{formatDate(notice.created_at)}</p>
        </div>
    </li>
);

/* ───────────────────────────────────────────────
   상세
─────────────────────────────────────────────── */
const NoticeDetail = ({ id }: { id: number }) => {
    const router = useRouter();
    const [notice, setNotice] = useState<Notice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotice(id)
            .then(setNotice)
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <div className="max-w-3xl mx-auto w-full animate-fade-in">
            <button
                onClick={() => router.push('/notices')}
                className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-primary transition-colors mb-5"
            >
                <ArrowLeft className="w-4 h-4" /> 공지사항 목록
            </button>

            {loading && (
                <div className="flex items-center justify-center py-20 gap-2 text-foreground-muted">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">불러오는 중...</span>
                </div>
            )}

            {!loading && !notice && (
                <div className="flex flex-col items-center justify-center py-20 text-foreground-muted">
                    <AlertCircle className="w-10 h-10 opacity-20 mb-3" />
                    <p className="text-sm">존재하지 않는 공지사항입니다.</p>
                </div>
            )}

            {!loading && notice && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
                    {/* 제목 영역 */}
                    <div className={`px-6 py-5 border-b border-border ${notice.is_pinned ? 'bg-primary-light/40' : 'bg-background-secondary'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            {notice.is_pinned && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-primary text-white">
                                    <Pin className="w-3 h-3" /> 공지
                                </span>
                            )}
                        </div>
                        <h2 className="text-lg font-extrabold text-foreground leading-tight">{notice.title}</h2>
                        <p className="text-xs text-foreground-muted mt-2">{formatDate(notice.created_at)}</p>
                    </div>

                    {/* 본문 */}
                    <div className="px-6 py-6">
                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                            {notice.content}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
