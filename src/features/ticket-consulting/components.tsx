'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useConsultingStore } from './store';
import { fetchSellPostsFromDB, createSellPost, fetchCompaniesFromDB, fetchMyCompany, upsertCompany, uploadCompanyImage, fetchBuyPostsFromDB, createBuyPost, fetchAllCompaniesAdmin, toggleCompanyActive } from './logic';
import { ListingType, SellPost, NewSellPost, Company, BuyPost, NewBuyPost, CompanyDB, NewCompany } from './types';
import { X, MessageCircle, BadgeCheck, Phone, ShoppingCart, Tag, CheckCircle2, PenSquare, ChevronRight, Loader2, Plus, Trash2, ImagePlus, Building2, Link, Star, Shield, ToggleLeft, ToggleRight, Pencil } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';

const TABS: { id: ListingType; label: string }[] = [
    { id: 'buy',  label: '삽니다' },
    { id: 'sell', label: '팝니다' },
];

export const CompanyListSection = () => {
    const router = useRouter();
    const openModal = useConsultingStore((state) => state.openModal);
    const { user, openModal: openAuthModal } = useAuthStore();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [sellPosts, setSellPosts] = useState<SellPost[]>([]);
    const [buyPosts, setBuyPosts] = useState<BuyPost[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [loadingBuyPosts, setLoadingBuyPosts] = useState(false);
    const [activeTab, setActiveTab] = useState<ListingType>('buy');
    const [offset, setOffset] = useState(0);

    const buyCompanies = companies.filter((c) => c.listingType === 'buy');

    useEffect(() => {
        fetchCompaniesFromDB().then(setCompanies);
    }, []);

    useEffect(() => { setOffset(0); }, [activeTab]);

    useEffect(() => {
        if (activeTab !== 'sell') return;
        setLoadingPosts(true);
        fetchSellPostsFromDB().then((posts) => { setSellPosts(posts); setLoadingPosts(false); });
    }, [activeTab]);

    useEffect(() => {
        if (activeTab !== 'buy') return;
        setLoadingBuyPosts(true);
        fetchBuyPostsFromDB().then((posts) => { setBuyPosts(posts); setLoadingBuyPosts(false); });
    }, [activeTab]);

    useEffect(() => {
        if (activeTab !== 'buy' || !buyCompanies.length) return;
        const id = setInterval(() => {
            setOffset((prev) => (prev + 1) % buyCompanies.length);
        }, 10000);
        return () => clearInterval(id);
    }, [buyCompanies.length, activeTab]);

    const displayed = buyCompanies.length
        ? [...buyCompanies.slice(offset), ...buyCompanies.slice(0, offset)]
        : [];

    return (
        <>
        <section id="company-list-section" className="w-full scroll-mt-24">

            {/* 탭 */}
            <div className="flex border-b border-border mb-6 bg-card rounded-t-xl overflow-hidden">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3.5 text-base font-bold transition-all relative ${
                            activeTab === tab.id
                                ? 'text-primary'
                                : 'text-foreground-muted hover:text-foreground'
                        }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* 삽니다: 업체 카드 + 구매 게시판 */}
            {activeTab === 'buy' && (
                <>
                    {/* 업체 섹션 헤더 */}
                    <div className="w-full flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                            <BadgeCheck className="text-primary w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-foreground">제휴 구매자 목록</h2>
                            <p className="text-xs text-foreground-muted mt-0.5">제휴구매자 · 총 {buyCompanies.length}개</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 w-full mb-8">
                        {displayed.map((company, index) => (
                            <CompanyCard
                                key={company.id}
                                company={company}
                                index={index}
                                onContact={company.contactLink ? undefined : () => openModal(company.id, company.name)}
                            />
                        ))}
                    </div>

                    {/* 제휴 구매 게시판 */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <div>
                                <h2 className="text-base font-bold text-foreground">제휴 구매 게시판</h2>
                                <p className="text-xs text-foreground-muted mt-0.5">제휴 구매자가 직접 상품권을 구매하는 게시글</p>
                            </div>
                            <button
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors shadow-sm"
                                onClick={() => { if (!user) openAuthModal('login'); else router.push('/write?tab=buy'); }}
                            >
                                <PenSquare className="w-3.5 h-3.5" />
                                글쓰기
                            </button>
                        </div>
                        <div className="hidden sm:grid grid-cols-[80px_1fr_140px_100px] px-5 py-2 bg-background-secondary border-b border-border text-xs font-semibold text-foreground-muted">
                            <span>종류</span><span>제목</span><span className="text-right">구매가</span><span className="text-right">날짜</span>
                        </div>
                        {loadingBuyPosts && (
                            <div className="flex items-center justify-center py-12 gap-2 text-foreground-muted">
                                <Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">불러오는 중...</span>
                            </div>
                        )}
                        {!loadingBuyPosts && buyPosts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-14 text-foreground-muted gap-2">
                                <ShoppingCart className="w-8 h-8 opacity-30" />
                                <p className="text-sm">등록된 구매 게시글이 없습니다.</p>
                            </div>
                        )}
                        <ul className="divide-y divide-border">
                            {!loadingBuyPosts && buyPosts.map((post) => (
                                <li key={post.id} className="px-5 py-3.5 hover:bg-background-secondary transition-colors cursor-pointer group">
                                    <div className="sm:hidden flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary-light text-primary">{post.ticketType}</span>
                                            <span className={`ml-auto text-[11px] font-semibold ${post.status === '구매완료' ? 'text-foreground-muted' : 'text-emerald-600'}`}>{post.status}</span>
                                        </div>
                                        <p className={`text-sm font-semibold ${post.status === '구매완료' ? 'text-foreground-muted line-through' : 'text-foreground'} group-hover:text-primary transition-colors`}>{post.title}</p>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <span className="text-xs text-foreground-muted">{post.author} · {post.createdAt}</span>
                                            <span className="text-sm font-bold text-primary">{post.buyPrice === '가격 협의' ? '가격 협의' : `${post.buyPrice.toLocaleString()}원`}</span>
                                        </div>
                                    </div>
                                    <div className="hidden sm:grid grid-cols-[80px_1fr_140px_100px] items-center gap-3">
                                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary-light text-primary w-fit">{post.ticketType}</span>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-semibold truncate ${post.status === '구매완료' ? 'text-foreground-muted line-through' : 'text-foreground'} group-hover:text-primary transition-colors`}>{post.title}</p>
                                                <span className={`text-[11px] font-semibold shrink-0 ${post.status === '구매완료' ? 'text-foreground-muted' : 'text-emerald-600'}`}>{post.status}</span>
                                            </div>
                                            <div className="flex gap-1.5 mt-0.5">{post.tags.map(t => <span key={t} className="text-xs text-foreground-muted">{t}</span>)}</div>
                                            <p className="text-xs text-foreground-muted mt-0.5">{post.author}</p>
                                        </div>
                                        <p className="text-sm font-bold text-primary text-right">{post.buyPrice === '가격 협의' ? '가격 협의' : `${post.buyPrice.toLocaleString()}원`}</p>
                                        <p className="text-xs text-foreground-muted text-right">{post.createdAt}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="px-5 py-3 border-t border-border text-center">
                            <button className="flex items-center gap-1 text-xs text-foreground-muted hover:text-primary transition-colors mx-auto">
                                더보기 <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
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
                            onClick={() => { if (!user) openAuthModal('login'); else router.push('/write?tab=sell'); }}
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

    </>
    );
};

interface CompanyCardProps {
    company: Company;
    index: number;
    onContact?: () => void;
}

const CompanyCard = ({ company, index, onContact }: CompanyCardProps) => {
    return (
        <div
            className="relative rounded-lg overflow-hidden animate-fade-in flex flex-col shadow-card-md hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-300"
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

/* ── BuyPostFormModal ── */
interface BuyPostFormModalProps { userId: string; onClose: () => void; onSubmitted: () => void; }

const BuyPostFormModal = ({ userId, onClose, onSubmitted }: BuyPostFormModalProps) => {
    const [form, setForm] = useState<NewBuyPost>({ ticket_type: '신세계', title: '', content: '', buy_price: null, is_price_negotiable: false, tags: [] });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const toggleTag = (tag: string) => setForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { setError('제목을 입력해주세요.'); return; }
        if (!form.is_price_negotiable && !form.buy_price) { setError('구매가를 입력하거나 가격 협의를 선택해주세요.'); return; }
        setSubmitting(true); setError('');
        const { error: err } = await createBuyPost(userId, form);
        setSubmitting(false);
        if (err) { setError('등록에 실패했습니다. 다시 시도해주세요.'); return; }
        onSubmitted();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card rounded-3xl w-full max-w-lg shadow-card-lg animate-slide-up z-10 border border-border overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-base font-bold text-foreground">구매 게시글 작성</h2>
                    <button onClick={onClose} className="text-foreground-muted hover:text-foreground bg-background-secondary rounded-full p-1.5 transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5">상품권 종류 *</label>
                        <select value={form.ticket_type} onChange={e => setForm(f => ({ ...f, ticket_type: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background-secondary text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
                            {['신세계', '롯데', '문화상품권', '해피머니', '컬쳐랜드', '기타'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5">제목 *</label>
                        <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="예) 신세계 50만원권 구매합니다" maxLength={80} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background-secondary text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5">구매가</label>
                        <div className="flex items-center gap-2 mb-2">
                            <input type="checkbox" id="buy-negotiable" checked={form.is_price_negotiable} onChange={e => setForm(f => ({ ...f, is_price_negotiable: e.target.checked, buy_price: null }))} className="accent-primary w-4 h-4" />
                            <label htmlFor="buy-negotiable" className="text-sm text-foreground cursor-pointer">가격 협의</label>
                        </div>
                        {!form.is_price_negotiable && (
                            <input type="number" min={0} value={form.buy_price ?? ''} onChange={e => setForm(f => ({ ...f, buy_price: e.target.value ? Number(e.target.value) : null }))} placeholder="구매 희망 금액 (원)" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background-secondary text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary transition-colors" />
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5">태그</label>
                        <div className="flex gap-2 flex-wrap">
                            {['전국', '모바일', '즉시'].map(tag => (
                                <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${form.tags.includes(tag) ? 'bg-primary text-white border-primary' : 'bg-background-secondary text-foreground-muted border-border hover:border-primary/40'}`}>#{tag}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5">상세 내용 (선택)</label>
                        <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="원하는 상품권 조건 등 추가 정보를 입력하세요." rows={3} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background-secondary text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary transition-colors resize-none" />
                    </div>
                    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                    <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />등록 중...</> : '게시글 등록'}
                    </button>
                </form>
            </div>
        </div>
    );
};

/* ── CompanyManageModal ── */
interface CompanyManageModalProps { userId: string; onClose: () => void; }

export const CompanyManageModal = ({ userId, onClose }: CompanyManageModalProps) => {
    const [company, setCompany] = useState<CompanyDB | null>(null);
    const [form, setForm] = useState<NewCompany>({ name: '', badges: [], icon_url: null, contact_link: null });
    const [badgeInput, setBadgeInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMyCompany(userId).then(c => {
            if (c) {
                setCompany(c);
                setForm({ name: c.name, badges: c.badges ?? [], icon_url: c.icon_url, contact_link: c.contact_link });
            }
        });
    }, [userId]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const url = await uploadCompanyImage(file, userId);
        setUploading(false);
        if (url) setForm(f => ({ ...f, icon_url: url }));
        else setError('이미지 업로드에 실패했습니다.');
    };

    const addBadge = () => {
        const b = badgeInput.trim();
        if (!b || form.badges.includes(b) || form.badges.length >= 4) return;
        setForm(f => ({ ...f, badges: [...f.badges, b] }));
        setBadgeInput('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('업체명을 입력해주세요.'); return; }
        setSubmitting(true); setError('');
        const { error: err } = await upsertCompany(userId, form, company?.id);
        setSubmitting(false);
        if (err) { setError('저장에 실패했습니다.'); return; }
        setSuccess(true);
        setTimeout(onClose, 1200);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card rounded-3xl w-full max-w-lg shadow-card-lg animate-slide-up z-10 border border-border overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        <h2 className="text-base font-bold text-foreground">내 업체 관리</h2>
                    </div>
                    <button onClick={onClose} className="text-foreground-muted hover:text-foreground bg-background-secondary rounded-full p-1.5 transition-colors"><X size={18} /></button>
                </div>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <CheckCircle2 className="w-12 h-12 text-primary" />
                        <p className="font-bold text-foreground">저장되었습니다!</p>
                    </div>
                ) : (
                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">

                    {/* 배경 이미지 */}
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-2">업체 배경 이미지</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-background-secondary flex items-center justify-center overflow-hidden shrink-0">
                                {form.icon_url ? (
                                    <img src={form.icon_url} alt="preview" className="w-full h-full object-contain" />
                                ) : (
                                    <ImagePlus className="w-7 h-7 text-foreground-muted opacity-40" />
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="px-4 py-2 rounded-lg bg-background-secondary border border-border text-xs font-semibold text-foreground hover:border-primary/40 transition-colors flex items-center gap-2 disabled:opacity-60">
                                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                                    {uploading ? '업로드 중...' : '이미지 선택'}
                                </button>
                                <p className="text-[11px] text-foreground-muted">PNG, JPG 권장 · 최대 5MB</p>
                            </div>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </div>

                    {/* 업체명 */}
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5">업체명 *</label>
                        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="예) 일등 티켓" maxLength={30} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background-secondary text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary transition-colors" />
                    </div>

                    {/* 뱃지 */}
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5">뱃지 태그 (최대 4개)</label>
                        <div className="flex gap-2 mb-2 flex-wrap">
                            {form.badges.map(b => (
                                <span key={b} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary border border-primary/20">
                                    <Star className="w-3 h-3" />{b}
                                    <button type="button" onClick={() => setForm(f => ({ ...f, badges: f.badges.filter(x => x !== b) }))} className="ml-0.5 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                        {form.badges.length < 4 && (
                            <div className="flex gap-2">
                                <input type="text" value={badgeInput} onChange={e => setBadgeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBadge())} placeholder="예) 정식사업자 업체 등록" maxLength={20} className="flex-1 px-3 py-2 rounded-xl border border-border bg-background-secondary text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary transition-colors" />
                                <button type="button" onClick={addBadge} className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors"><Plus className="w-4 h-4" /></button>
                            </div>
                        )}
                    </div>

                    {/* 연결 링크 */}
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5 flex items-center gap-1"><Link className="w-3.5 h-3.5" /> 상담 연결 링크 (Line/카카오)</label>
                        <input type="url" value={form.contact_link ?? ''} onChange={e => setForm(f => ({ ...f, contact_link: e.target.value || null }))} placeholder="https://line.me/ti/p/~..." className="w-full px-3 py-2.5 rounded-xl border border-border bg-background-secondary text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary transition-colors" />
                    </div>

                    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                    <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />저장 중...</> : '저장하기'}
                    </button>
                </form>
                )}
            </div>
        </div>
    );
};

export const ConsultingQrModal = () => {
    const { isModalOpen, selectedCompanyId, selectedCompanyName, closeModal } = useConsultingStore();
    if (!isModalOpen || !selectedCompanyId) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
            <div className="relative bg-card rounded-3xl p-8 max-w-sm w-full shadow-card-lg animate-slide-up z-10 flex flex-col items-center border border-border">
                <button onClick={closeModal} className="absolute right-4 top-4 text-foreground-muted hover:text-foreground bg-background-secondary rounded-full p-1.5 transition-colors">
                    <X size={18} />
                </button>
                <h2 className="text-xl font-extrabold mb-1 text-primary text-center">{selectedCompanyName}</h2>
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

/* ── AdminCompanyPanel ── */
export const AdminCompanyPanel = ({ onClose }: { onClose: () => void }) => {
    const { user } = useAuthStore();
    const [companies, setCompanies] = useState<CompanyDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [editTarget, setEditTarget] = useState<CompanyDB | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    const load = () => {
        setLoading(true);
        fetchAllCompaniesAdmin().then(data => { setCompanies(data); setLoading(false); });
    };

    useEffect(() => { load(); }, []);

    const handleToggle = async (c: CompanyDB) => {
        await toggleCompanyActive(c.id, !c.is_active);
        load();
    };

    if (editTarget) {
        return (
            <AdminEditModal
                company={editTarget}
                onClose={() => setEditTarget(null)}
                onSaved={() => { setEditTarget(null); load(); }}
            />
        );
    }

    if (showCreate && user) {
        return (
            <AdminCreateModal
                adminId={user.id}
                onClose={() => setShowCreate(false)}
                onSaved={() => { setShowCreate(false); load(); }}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card rounded-3xl w-full max-w-2xl shadow-card-lg animate-slide-up z-10 border border-border overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <h2 className="text-base font-bold text-foreground">관리자 — 업체 관리</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"><Plus className="w-3.5 h-3.5" />새 업체 추가</button>
                        <button onClick={load} className="px-3 py-1.5 text-xs rounded-lg bg-background-secondary border border-border text-foreground-muted hover:text-foreground transition-colors">새로고침</button>
                        <button onClick={onClose} className="text-foreground-muted hover:text-foreground bg-background-secondary rounded-full p-1.5 transition-colors"><X size={18} /></button>
                    </div>
                </div>

                <div className="max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-16 gap-2 text-foreground-muted">
                            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">불러오는 중...</span>
                        </div>
                    ) : companies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-2 text-foreground-muted">
                            <Building2 className="w-8 h-8 opacity-30" />
                            <p className="text-sm">등록된 업체가 없습니다.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-border">
                            {companies.map(c => (
                                <li key={c.id} className="flex items-center gap-3 px-6 py-4 hover:bg-background-secondary transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-background-secondary border border-border overflow-hidden shrink-0 flex items-center justify-center">
                                        {c.icon_url
                                            ? <img src={c.icon_url} alt={c.name} className="w-full h-full object-contain" />
                                            : <Building2 className="w-5 h-5 text-foreground-muted opacity-40" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{c.name}</p>
                                        <div className="flex gap-1.5 mt-0.5 flex-wrap">
                                            {(c.badges ?? []).map(b => (
                                                <span key={b} className="text-[11px] px-1.5 py-0.5 rounded bg-primary-light text-primary font-medium">{b}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => handleToggle(c)}
                                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${c.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-background-secondary text-foreground-muted border-border hover:border-primary/40'}`}
                                        >
                                            {c.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                            {c.is_active ? '활성' : '비활성'}
                                        </button>
                                        <button
                                            onClick={() => setEditTarget(c)}
                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-border bg-background-secondary text-foreground-muted hover:text-primary hover:border-primary/40 transition-colors"
                                        >
                                            <Pencil className="w-3.5 h-3.5" /> 수정
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

interface AdminEditModalProps { company: CompanyDB; onClose: () => void; onSaved: () => void; }

const AdminEditModal = ({ company, onClose, onSaved }: AdminEditModalProps) => {
    const [form, setForm] = useState<NewCompany>({
        name: company.name,
        badges: company.badges ?? [],
        icon_url: company.icon_url,
        contact_link: company.contact_link,
    });
    const [badgeInput, setBadgeInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const url = await uploadCompanyImage(file, company.owner_id);
        setUploading(false);
        if (url) setForm(f => ({ ...f, icon_url: url }));
        else setError('이미지 업로드에 실패했습니다.');
    };

    const addBadge = () => {
        const b = badgeInput.trim();
        if (!b || form.badges.includes(b) || form.badges.length >= 4) return;
        setForm(f => ({ ...f, badges: [...f.badges, b] }));
        setBadgeInput('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('업체명을 입력해주세요.'); return; }
        setSubmitting(true); setError('');
        const { error: err } = await upsertCompany(company.owner_id, form, company.id);
        setSubmitting(false);
        if (err) { setError('저장에 실패했습니다.'); return; }
        onSaved();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card rounded-3xl w-full max-w-lg shadow-card-lg animate-slide-up z-10 border border-border overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-base font-bold text-foreground">업체 수정 — {company.name}</h2>
                    <button onClick={onClose} className="text-foreground-muted hover:text-foreground bg-background-secondary rounded-full p-1.5 transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-2">배경 이미지</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-background-secondary flex items-center justify-center overflow-hidden shrink-0">
                                {form.icon_url ? <img src={form.icon_url} alt="preview" className="w-full h-full object-contain" /> : <ImagePlus className="w-7 h-7 text-foreground-muted opacity-40" />}
                            </div>
                            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="px-4 py-2 rounded-lg bg-background-secondary border border-border text-xs font-semibold text-foreground hover:border-primary/40 transition-colors flex items-center gap-2 disabled:opacity-60">
                                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                                {uploading ? '업로드 중...' : '이미지 선택'}
                            </button>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5">업체명 *</label>
                        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} maxLength={30} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background-secondary text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5">뱃지 (최대 4개)</label>
                        <div className="flex gap-2 mb-2 flex-wrap">
                            {form.badges.map(b => (
                                <span key={b} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary border border-primary/20">
                                    <Star className="w-3 h-3" />{b}
                                    <button type="button" onClick={() => setForm(f => ({ ...f, badges: f.badges.filter(x => x !== b) }))} className="ml-0.5 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                        {form.badges.length < 4 && (
                            <div className="flex gap-2">
                                <input type="text" value={badgeInput} onChange={e => setBadgeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBadge())} placeholder="뱃지 입력" maxLength={20} className="flex-1 px-3 py-2 rounded-xl border border-border bg-background-secondary text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                                <button type="button" onClick={addBadge} className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors"><Plus className="w-4 h-4" /></button>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5 flex items-center gap-1"><Link className="w-3.5 h-3.5" />상담 링크</label>
                        <input type="url" value={form.contact_link ?? ''} onChange={e => setForm(f => ({ ...f, contact_link: e.target.value || null }))} placeholder="https://line.me/..." className="w-full px-3 py-2.5 rounded-xl border border-border bg-background-secondary text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                    <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />저장 중...</> : '저장하기'}
                    </button>
                </form>
            </div>
        </div>
    );
};

/* ── AdminCreateModal ── */
const AdminCreateModal = ({ adminId, onClose, onSaved }: { adminId: string; onClose: () => void; onSaved: () => void }) => {
    const [form, setForm] = useState<NewCompany>({ name: '', badges: [], icon_url: null, contact_link: null });
    const [badgeInput, setBadgeInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const url = await uploadCompanyImage(file, adminId);
        setUploading(false);
        if (url) setForm(f => ({ ...f, icon_url: url }));
        else setError('이미지 업로드에 실패했습니다.');
    };

    const addBadge = () => {
        const b = badgeInput.trim();
        if (!b || form.badges.includes(b) || form.badges.length >= 4) return;
        setForm(f => ({ ...f, badges: [...f.badges, b] }));
        setBadgeInput('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('업체명을 입력해주세요.'); return; }
        setSubmitting(true); setError('');
        const { error: err } = await upsertCompany(adminId, form);
        setSubmitting(false);
        if (err) { setError('저장에 실패했습니다.'); return; }
        onSaved();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card rounded-3xl w-full max-w-lg shadow-card-lg animate-slide-up z-10 border border-border overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-base font-bold text-foreground">새 업체 추가</h2>
                    <button onClick={onClose} className="text-foreground-muted hover:text-foreground bg-background-secondary rounded-full p-1.5 transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-2">업체 이미지</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-background-secondary flex items-center justify-center overflow-hidden shrink-0">
                                {form.icon_url ? <img src={form.icon_url} alt="preview" className="w-full h-full object-contain" /> : <ImagePlus className="w-7 h-7 text-foreground-muted opacity-40" />}
                            </div>
                            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="px-4 py-2 rounded-lg bg-background-secondary border border-border text-xs font-semibold text-foreground hover:border-primary/40 transition-colors flex items-center gap-2 disabled:opacity-60">
                                <ImagePlus className="w-4 h-4" />{uploading ? '업로드 중...' : '이미지 선택'}
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5">업체명 *</label>
                        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} maxLength={30} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background-secondary text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5">뱃지 (최대 4개)</label>
                        <div className="flex gap-2 mb-2 flex-wrap">
                            {form.badges.map(b => (
                                <span key={b} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary border border-primary/20">
                                    <Star className="w-3 h-3" />{b}
                                    <button type="button" onClick={() => setForm(f => ({ ...f, badges: f.badges.filter(x => x !== b) }))} className="ml-0.5 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                        {form.badges.length < 4 && (
                            <div className="flex gap-2">
                                <input type="text" value={badgeInput} onChange={e => setBadgeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBadge())} placeholder="뱃지 입력" maxLength={20} className="flex-1 px-3 py-2 rounded-xl border border-border bg-background-secondary text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                                <button type="button" onClick={addBadge} className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors"><Plus className="w-4 h-4" /></button>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5 flex items-center gap-1"><Link className="w-3.5 h-3.5" />상담 링크</label>
                        <input type="url" value={form.contact_link ?? ''} onChange={e => setForm(f => ({ ...f, contact_link: e.target.value || null }))} placeholder="https://line.me/..." className="w-full px-3 py-2.5 rounded-xl border border-border bg-background-secondary text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                    <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />추가 중...</> : '업체 추가'}
                    </button>
                </form>
            </div>
        </div>
    );
};
