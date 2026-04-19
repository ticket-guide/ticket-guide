'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useConsultingStore } from './store';
import { getCompanies, getModalTitleForType, getSellPosts, fetchSellPostsFromDB, createSellPost } from './logic';
import { ListingType, SellPost, NewSellPost } from './types';
import { X, MessageCircle, BadgeCheck, Phone, ShoppingCart, Tag, CheckCircle2, PenSquare, ChevronRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';

const TABS: { id: ListingType; label: string; icon: React.ReactNode }[] = [
    { id: 'buy',  label: '삽니다', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'sell', label: '팝니다', icon: <Tag className="w-4 h-4" /> },
];

export const CompanyListSection = () => {
    const openModal = useConsultingStore((state) => state.openModal);
    const { user, openModal: openAuthModal } = useAuthStore();
    const companies = getCompanies();
    const [sellPosts, setSellPosts] = useState<SellPost[]>(getSellPosts());
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [showPostForm, setShowPostForm] = useState(false);
    const [activeTab, setActiveTab] = useState<ListingType>('buy');
    const [offset, setOffset] = useState(0);

    const filtered = companies.filter((c) => c.listingType === activeTab);

    useEffect(() => { setOffset(0); }, [activeTab]);

    useEffect(() => {
        if (activeTab !== 'sell') return;
        setLoadingPosts(true);
        fetchSellPostsFromDB().then((posts) => {
            setSellPosts(posts);
            setLoadingPosts(false);
        });
    }, [activeTab]);

    useEffect(() => {
        if (activeTab !== 'buy' || !filtered.length) return;
        const id = setInterval(() => {
            setOffset((prev) => (prev + 1) % filtered.length);
        }, 10000);
        return () => clearInterval(id);
    }, [filtered.length, activeTab]);

    const displayed = filtered.length
        ? [...filtered.slice(offset), ...filtered.slice(0, offset)]
        : [];

    return (
        <>
        <section id="company-list-section" className="w-full scroll-mt-24">

            {/* 탭 */}
            <div className="flex gap-2 mb-4">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === tab.id
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-card border border-border text-foreground-muted hover:border-primary/40 hover:text-primary'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 삽니다: 업체 카드 그리드 */}
            {activeTab === 'buy' && (
                <>
                    <div className="w-full flex items-center justify-between bg-card border border-border rounded-2xl px-5 py-4 shadow-card mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
                                <BadgeCheck className="text-primary w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-foreground">상품권 매입 업체 목록</h2>
                                <p className="text-xs text-foreground-muted mt-0.5">인증된 검증 업체 · 총 {filtered.length}개</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 w-full">
                        {displayed.map((company, index) => (
                            <CompanyCard
                                key={company.id}
                                company={company}
                                index={index}
                                onContact={company.contactLink ? undefined : () => openModal(company.id)}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* 팝니다: 게시판 리스트 */}
            {activeTab === 'sell' && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
                    {/* 게시판 헤더 */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <div>
                            <h2 className="text-base font-bold text-foreground">판매 게시판</h2>
                            <p className="text-xs text-foreground-muted mt-0.5">상품권을 직접 판매하는 게시글 목록</p>
                        </div>
                        <button
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors shadow-sm"
                            onClick={() => { if (!user) openAuthModal('login'); else setShowPostForm(true); }}
                        >
                            <PenSquare className="w-3.5 h-3.5" />
                            글쓰기
                        </button>
                    </div>

                    {/* 컬럼 헤더 */}
                    <div className="hidden sm:grid grid-cols-[80px_1fr_160px_100px] px-5 py-2 bg-background-secondary border-b border-border text-xs font-semibold text-foreground-muted">
                        <span>종류</span>
                        <span>제목</span>
                        <span className="text-right">가격</span>
                        <span className="text-right">날짜</span>
                    </div>

                    {/* 게시글 목록 */}
                    {loadingPosts && (
                        <div className="flex items-center justify-center py-12 text-foreground-muted gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">불러오는 중...</span>
                        </div>
                    )}
                    {!loadingPosts && sellPosts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-14 text-foreground-muted gap-2">
                            <Tag className="w-8 h-8 opacity-30" />
                            <p className="text-sm">등록된 판매 게시글이 없습니다.</p>
                            <p className="text-xs">글쓰기 버튼으로 첫 번째 게시글을 등록해보세요.</p>
                        </div>
                    )}
                    <ul className="divide-y divide-border">
                        {!loadingPosts && sellPosts.map((post) => (
                            <li
                                key={post.id}
                                className="px-5 py-3.5 hover:bg-background-secondary transition-colors cursor-pointer group"
                            >
                                {/* 모바일: 세로 레이아웃 */}
                                <div className="sm:hidden flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary-light text-primary">{post.ticketType}</span>
                                        {post.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                                        <span className={`ml-auto text-[11px] font-semibold ${post.status === '판매완료' ? 'text-foreground-muted' : 'text-emerald-600'}`}>{post.status}</span>
                                    </div>
                                    <p className={`text-sm font-semibold ${post.status === '판매완료' ? 'text-foreground-muted line-through' : 'text-foreground'} group-hover:text-primary transition-colors`}>{post.title}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs text-amber-600 font-medium">{post.deliveryDeadline}</span>
                                        {post.tags.map(t => <span key={t} className="text-xs text-foreground-muted">{t}</span>)}
                                    </div>
                                    <div className="flex items-center justify-between mt-0.5">
                                        <span className="text-xs text-foreground-muted">{post.author} · {post.createdAt}</span>
                                        {post.sellPrice === '가격 협의' ? (
                                            <span className="text-sm font-bold text-primary">가격 협의</span>
                                        ) : (
                                            <div className="text-right">
                                                {post.originalPrice && <span className="text-xs text-foreground-muted line-through mr-1">{post.originalPrice.toLocaleString()}원</span>}
                                                {post.discountRate && <span className="text-xs font-bold text-red-500 mr-1">{post.discountRate}%</span>}
                                                <span className="text-sm font-bold text-foreground">{post.sellPrice.toLocaleString()}원</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* PC: 가로 그리드 레이아웃 */}
                                <div className="hidden sm:grid grid-cols-[80px_1fr_160px_100px] items-center gap-3">
                                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary-light text-primary w-fit">{post.ticketType}</span>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className={`text-sm font-semibold truncate ${post.status === '판매완료' ? 'text-foreground-muted line-through' : 'text-foreground'} group-hover:text-primary transition-colors`}>{post.title}</p>
                                            {post.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                                            <span className={`text-[11px] font-semibold ${post.status === '판매완료' ? 'text-foreground-muted' : 'text-emerald-600'}`}>{post.status}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <span className="text-xs text-amber-600 font-medium">{post.deliveryDeadline}</span>
                                            {post.tags.map(t => <span key={t} className="text-xs text-foreground-muted">{t}</span>)}
                                        </div>
                                        <p className="text-xs text-foreground-muted mt-0.5">{post.author}</p>
                                    </div>

                                    <div className="text-right">
                                        {post.sellPrice === '가격 협의' ? (
                                            <span className="text-sm font-bold text-primary">가격 협의</span>
                                        ) : (
                                            <>
                                                {post.originalPrice && <p className="text-xs text-foreground-muted line-through">{post.originalPrice.toLocaleString()}원</p>}
                                                <p className="text-sm font-bold text-foreground">
                                                    {post.discountRate && <span className="text-red-500 mr-1">{post.discountRate}%</span>}
                                                    {post.sellPrice.toLocaleString()}원
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    <p className="text-xs text-foreground-muted text-right">{post.createdAt}</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* 더보기 */}
                    <div className="px-5 py-3 border-t border-border text-center">
                        <button className="flex items-center gap-1 text-xs text-foreground-muted hover:text-primary transition-colors mx-auto">
                            더보기 <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </section>

        {showPostForm && user && (
            <SellPostFormModal
                onClose={() => setShowPostForm(false)}
                onSubmitted={() => {
                    setShowPostForm(false);
                    setLoadingPosts(true);
                    fetchSellPostsFromDB().then((posts) => {
                        setSellPosts(posts);
                        setLoadingPosts(false);
                    });
                }}
                userId={user.id}
            />
        )}
    </>
    );
};

interface CompanyCardProps {
    company: ReturnType<typeof getCompanies>[number];
    index: number;
    onContact?: () => void;
}

const CompanyCard = ({ company, index, onContact }: CompanyCardProps) => {
    return (
        <div
            className="relative rounded-2xl overflow-hidden animate-fade-in flex flex-col shadow-card-md hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-300"
            style={{ animationDelay: `${index * 80}ms`, minHeight: '220px' }}
        >
            <div className="absolute inset-0 bg-zinc-900" />
            {company.iconUrl && (
                <div
                    className="absolute inset-0 bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${company.iconUrl})`,
                        backgroundSize: 'contain',
                        opacity: 0.85,
                    }}
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70" />

            <div className="absolute top-3 right-3 z-10">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary text-white shadow">
                    <BadgeCheck className="w-3 h-3" /> 인증
                </span>
            </div>

            <div className="relative z-10 flex flex-col flex-1 p-5">
                <h3 className="text-xl font-extrabold text-white drop-shadow mb-2 leading-tight pr-16">
                    {company.name}
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-auto">
                    {company.badges?.map((badge, bIdx) => (
                        <span key={bIdx} className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                            {badge}
                        </span>
                    ))}
                </div>
                <div className="mt-4">
                    {company.contactLink ? (
                        <a
                            href={company.contactLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow transition-colors"
                        >
                            <Phone className="w-4 h-4" /> 실시간 상담 연결
                        </a>
                    ) : (
                        <button
                            onClick={onContact}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow transition-colors"
                        >
                            <MessageCircle className="w-4 h-4" /> 실시간 상담 연결
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const TICKET_TYPES = ['신세계', '롯데', '문화상품권', '해피머니', '컬쳐랜드', '기타'];
const DEADLINE_OPTIONS = ['즉시 발송', '3일 이내 발송', '7일 이내 발송', '14일 이내 발송', '협의'];
const TAG_OPTIONS = ['전국', '모바일', '택배가능'];

interface SellPostFormModalProps {
    userId: string;
    onClose: () => void;
    onSubmitted: () => void;
}

const SellPostFormModal = ({ userId, onClose, onSubmitted }: SellPostFormModalProps) => {
    const [form, setForm] = useState<NewSellPost>({
        ticket_type: '신세계',
        title: '',
        content: '',
        sell_price: null,
        original_price: null,
        is_price_negotiable: false,
        delivery_deadline: '7일 이내 발송',
        tags: [],
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const toggleTag = (tag: string) => {
        setForm((f) => ({
            ...f,
            tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { setError('제목을 입력해주세요.'); return; }
        if (!form.is_price_negotiable && !form.sell_price) { setError('판매가를 입력하거나 가격 협의를 선택해주세요.'); return; }
        setSubmitting(true);
        setError('');
        const { error: err } = await createSellPost(userId, form);
        setSubmitting(false);
        if (err) { setError('게시글 등록에 실패했습니다. 다시 시도해주세요.'); return; }
        onSubmitted();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card rounded-3xl w-full max-w-lg shadow-card-lg animate-slide-up z-10 border border-border overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-base font-bold text-foreground">판매 게시글 작성</h2>
                    <button onClick={onClose} className="text-foreground-muted hover:text-foreground bg-background-secondary rounded-full p-1.5 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
                    {/* 상품권 종류 */}
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5">상품권 종류 *</label>
                        <select
                            value={form.ticket_type}
                            onChange={(e) => setForm((f) => ({ ...f, ticket_type: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background-secondary text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        >
                            {TICKET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* 제목 */}
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5">제목 *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            placeholder="예) 신세계 50만원권 판매합니다"
                            maxLength={80}
                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background-secondary text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    {/* 가격 */}
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5">가격</label>
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                id="negotiable"
                                checked={form.is_price_negotiable}
                                onChange={(e) => setForm((f) => ({ ...f, is_price_negotiable: e.target.checked, sell_price: null }))}
                                className="accent-primary w-4 h-4"
                            />
                            <label htmlFor="negotiable" className="text-sm text-foreground cursor-pointer">가격 협의</label>
                        </div>
                        {!form.is_price_negotiable && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-foreground-muted mb-1">판매가 (원) *</p>
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.sell_price ?? ''}
                                        onChange={(e) => setForm((f) => ({ ...f, sell_price: e.target.value ? Number(e.target.value) : null }))}
                                        placeholder="판매 금액"
                                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background-secondary text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs text-foreground-muted mb-1">원가 (원, 선택)</p>
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.original_price ?? ''}
                                        onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value ? Number(e.target.value) : null }))}
                                        placeholder="원래 금액"
                                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background-secondary text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 발송 기한 */}
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5">발송 기한 *</label>
                        <select
                            value={form.delivery_deadline}
                            onChange={(e) => setForm((f) => ({ ...f, delivery_deadline: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background-secondary text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        >
                            {DEADLINE_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    {/* 태그 */}
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5">태그 (중복 선택 가능)</label>
                        <div className="flex gap-2 flex-wrap">
                            {TAG_OPTIONS.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                        form.tags.includes(tag)
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-background-secondary text-foreground-muted border-border hover:border-primary/40'
                                    }`}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 내용 */}
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5">상세 내용 (선택)</label>
                        <textarea
                            value={form.content}
                            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                            placeholder="상품권 상태, 거래 방법 등 추가 정보를 입력하세요."
                            rows={3}
                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background-secondary text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary transition-colors resize-none"
                        />
                    </div>

                    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />등록 중...</> : '게시글 등록'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export const ConsultingQrModal = () => {
    const { isModalOpen, selectedType, closeModal } = useConsultingStore();
    if (!isModalOpen || !selectedType) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
            <div className="relative bg-card rounded-3xl p-8 max-w-sm w-full shadow-card-lg animate-slide-up z-10 flex flex-col items-center border border-border">
                <button onClick={closeModal} className="absolute right-4 top-4 text-foreground-muted hover:text-foreground bg-background-secondary rounded-full p-1.5 transition-colors">
                    <X size={18} />
                </button>
                <h2 className="text-xl font-extrabold mb-1 text-primary text-center">{getModalTitleForType(selectedType)}</h2>
                <p className="text-xs text-foreground-muted mb-7 text-center">QR 코드를 스캔하여 24시간 실시간 상담을 시작하세요.</p>
                <div className="w-44 h-44 bg-background-secondary rounded-2xl flex items-center justify-center overflow-hidden border-2 border-primary/20 p-2">
                    <div className="w-full h-full bg-card rounded-xl flex items-center justify-center text-foreground-muted border border-dashed border-border">
                        <div className="text-center">
                            <MessageCircle className="mx-auto mb-2 opacity-40 text-primary" size={28} />
                            <span className="text-xs font-semibold">업체 상담 QR</span>
                        </div>
                    </div>
                </div>
                <div className="mt-7 text-center bg-primary-light w-full rounded-2xl py-4 border border-primary/20">
                    <p className="font-semibold text-foreground text-sm">또는 메신저 검색창 활용</p>
                    <p className="text-sm font-bold text-primary mt-1">@티켓가이드상담</p>
                </div>
            </div>
        </div>
    );
};
