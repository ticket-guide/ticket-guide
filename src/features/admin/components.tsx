'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ShieldOff, Loader2, RefreshCw, Users, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';
import { fetchAllMembers, setAdminStatus, setUserType, deleteUserById, formatDate } from './logic';
import { MemberRow } from './types';

export const AdminContent = () => {
    const router = useRouter();
    const { user } = useAuthStore();
    const [members, setMembers] = useState<MemberRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [changingTypeId, setChangingTypeId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) { router.replace('/'); return; }
        if (!user.isAdmin) { router.replace('/'); return; }
        load();
    }, [user]);

    const load = async () => {
        setLoading(true);
        const data = await fetchAllMembers();
        setMembers(data);
        setLoading(false);
    };

    const handleToggleAdmin = async (member: MemberRow) => {
        if (member.id === user?.id) return;
        setTogglingId(member.id);
        await setAdminStatus(member.id, !member.is_admin);
        setTogglingId(null);
        load();
    };

    const handleChangeType = async (member: MemberRow) => {
        setChangingTypeId(member.id);
        const next = member.user_type === 'affiliate' ? 'general' : 'affiliate';
        await setUserType(member.id, next);
        setChangingTypeId(null);
        load();
    };

    const handleDelete = async (member: MemberRow) => {
        if (member.id === user?.id) return;
        if (!window.confirm(`"${member.nickname}" 회원을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
        setDeletingId(member.id);
        const { error } = await deleteUserById(member.id);
        setDeletingId(null);
        if (error) { alert('삭제에 실패했습니다: ' + error.message); return; }
        load();
    };

    if (!user || !user.isAdmin) return null;

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-foreground">회원 관리</h1>
                            <p className="text-sm text-foreground-muted">총 {members.length}명</p>
                        </div>
                    </div>
                    <button
                        onClick={load}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-foreground-muted hover:text-foreground hover:border-primary/40 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        새로고침
                    </button>
                </div>

                {/* 회원 목록 */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20 text-foreground-muted">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            불러오는 중...
                        </div>
                    ) : members.length === 0 ? (
                        <div className="py-20 text-center text-foreground-muted text-sm">회원이 없습니다.</div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-background/50">
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wide">닉네임</th>
                                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wide">유형</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wide">가입일</th>
                                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wide">관리자</th>
                                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wide">권한 변경</th>
                                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-foreground-muted uppercase tracking-wide">삭제</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((m, i) => (
                                    <tr
                                        key={m.id}
                                        className={`border-b border-border last:border-0 transition-colors ${m.id === user?.id ? 'bg-primary/5' : 'hover:bg-background/60'}`}
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                    {m.nickname[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground text-sm">{m.nickname}</p>
                                                    {m.id === user?.id && (
                                                        <p className="text-xs text-primary">나</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => handleChangeType(m)}
                                                disabled={changingTypeId === m.id}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors disabled:opacity-50 ${
                                                    m.user_type === 'affiliate'
                                                        ? 'bg-violet-50 border-violet-200 text-violet-600 hover:bg-violet-100'
                                                        : 'bg-background border-border text-foreground-muted hover:border-primary/40 hover:text-primary'
                                                }`}
                                            >
                                                {changingTypeId === m.id
                                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                                    : m.user_type === 'affiliate' ? '제휴' : '일반'}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-foreground-muted">
                                            {formatDate(m.created_at)}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {m.is_admin ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                                                    <Shield className="w-3 h-3" /> 관리자
                                                </span>
                                            ) : (
                                                <span className="text-xs text-foreground-muted">일반</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {m.id === user?.id ? (
                                                <span className="text-xs text-foreground-muted">변경 불가</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleToggleAdmin(m)}
                                                    disabled={togglingId === m.id}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
                                                        m.is_admin
                                                            ? 'border-red-200 text-red-500 hover:bg-red-50'
                                                            : 'border-primary/30 text-primary hover:bg-primary/10'
                                                    }`}
                                                >
                                                    {togglingId === m.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : m.is_admin ? (
                                                        <><ShieldOff className="w-3 h-3" />해제</>
                                                    ) : (
                                                        <><Shield className="w-3 h-3" />부여</>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {m.id === user?.id ? (
                                                <span className="text-xs text-foreground-muted">—</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleDelete(m)}
                                                    disabled={deletingId === m.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                >
                                                    {deletingId === m.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <><Trash2 className="w-3 h-3" />삭제</>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <p className="text-xs text-foreground-muted text-center mt-4">
                    본인 계정은 삭제·권한 변경이 불가합니다.
                </p>
            </div>
        </div>
    );
};
