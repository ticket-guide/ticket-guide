'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';
import { createSellPost, createBuyPost } from '@/features/ticket-consulting/logic';
import { NewSellPost, NewBuyPost } from '@/features/ticket-consulting/types';

const TICKET_TYPES = ['신세계', '롯데', '문화상품권', '해피머니', '컬쳐랜드', '기타'];
const DEADLINE_OPTIONS = ['즉시 발송', '3일 이내 발송', '7일 이내 발송', '14일 이내 발송', '협의'];
const SELL_TAGS = ['전국', '모바일', '택배가능'];
const BUY_TAGS = ['전국', '모바일', '즉시'];

type Tab = 'sell' | 'buy';

export const WriteContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, openModal } = useAuthStore();

    const initialTab = (searchParams.get('tab') === 'buy' ? 'buy' : 'sell') as Tab;
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);

    useEffect(() => {
        if (!user) {
            openModal('login');
            router.replace('/');
        }
    }, [user]);

    if (!user) return null;

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        router.replace(`/write?tab=${tab}`, { scroll: false });
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* 뒤로가기 */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    뒤로가기
                </button>

                <h1 className="text-2xl font-extrabold text-foreground mb-6">글쓰기</h1>

                {/* 탭 */}
                <div className="flex border-b border-border mb-8">
                    {([['sell', '팝니다'], ['buy', '삽니다']] as [Tab, string][]).map(([tab, label]) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-6 py-3 text-sm font-bold relative transition-colors ${
                                activeTab === tab ? 'text-primary' : 'text-foreground-muted hover:text-foreground'
                            }`}
                        >
                            {label}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {activeTab === 'sell' ? (
                    <SellForm userId={user.id} onSubmitted={() => router.push('/?tab=sell')} />
                ) : (
                    <BuyForm userId={user.id} onSubmitted={() => router.push('/?tab=buy')} />
                )}
            </div>
        </div>
    );
};

/* ── 판매 폼 ── */
const SellForm = ({ userId, onSubmitted }: { userId: string; onSubmitted: () => void }) => {
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

    const toggleTag = (tag: string) =>
        setForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { setError('제목을 입력해주세요.'); return; }
        if (!form.is_price_negotiable && !form.sell_price) { setError('판매가를 입력하거나 가격 협의를 선택해주세요.'); return; }
        setSubmitting(true); setError('');
        const { error: err } = await createSellPost(userId, form);
        setSubmitting(false);
        if (err) { setError('게시글 등록에 실패했습니다. 다시 시도해주세요.'); return; }
        onSubmitted();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Field label="상품권 종류 *">
                <select
                    value={form.ticket_type}
                    onChange={e => setForm(f => ({ ...f, ticket_type: e.target.value }))}
                    className={selectCls}
                >
                    {TICKET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </Field>

            <Field label="제목 *">
                <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="예) 신세계 50만원권 판매합니다"
                    maxLength={80}
                    className={inputCls}
                />
                <p className="text-xs text-foreground-muted mt-1 text-right">{form.title.length}/80</p>
            </Field>

            <Field label="가격">
                <label className="flex items-center gap-2 mb-3 cursor-pointer w-fit">
                    <input
                        type="checkbox"
                        checked={form.is_price_negotiable}
                        onChange={e => setForm(f => ({ ...f, is_price_negotiable: e.target.checked, sell_price: null }))}
                        className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm text-foreground">가격 협의</span>
                </label>
                {!form.is_price_negotiable && (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-xs text-foreground-muted mb-1.5">판매가 (원) *</p>
                            <input
                                type="number" min={0}
                                value={form.sell_price ?? ''}
                                onChange={e => setForm(f => ({ ...f, sell_price: e.target.value ? Number(e.target.value) : null }))}
                                placeholder="판매 금액"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <p className="text-xs text-foreground-muted mb-1.5">원가 (원, 선택)</p>
                            <input
                                type="number" min={0}
                                value={form.original_price ?? ''}
                                onChange={e => setForm(f => ({ ...f, original_price: e.target.value ? Number(e.target.value) : null }))}
                                placeholder="원래 금액"
                                className={inputCls}
                            />
                        </div>
                    </div>
                )}
            </Field>

            <Field label="발송 기한 *">
                <select
                    value={form.delivery_deadline}
                    onChange={e => setForm(f => ({ ...f, delivery_deadline: e.target.value }))}
                    className={selectCls}
                >
                    {DEADLINE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </Field>

            <Field label="태그">
                <div className="flex gap-2 flex-wrap">
                    {SELL_TAGS.map(tag => (
                        <button key={tag} type="button" onClick={() => toggleTag(tag)} className={tagCls(form.tags.includes(tag))}>
                            #{tag}
                        </button>
                    ))}
                </div>
            </Field>

            <Field label="상세 내용 (선택)">
                <textarea
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    placeholder="상품권 상태, 거래 방법 등 추가 정보를 입력하세요."
                    rows={5}
                    className={`${inputCls} resize-none`}
                />
            </Field>

            {error && <ErrorMsg msg={error} />}

            <button type="submit" disabled={submitting} className={submitCls}>
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />등록 중...</> : '판매 게시글 등록'}
            </button>
        </form>
    );
};

/* ── 구매 폼 ── */
const BuyForm = ({ userId, onSubmitted }: { userId: string; onSubmitted: () => void }) => {
    const [form, setForm] = useState<NewBuyPost>({
        ticket_type: '신세계',
        title: '',
        content: '',
        buy_price: null,
        is_price_negotiable: false,
        tags: [],
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const toggleTag = (tag: string) =>
        setForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }));

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Field label="상품권 종류 *">
                <select
                    value={form.ticket_type}
                    onChange={e => setForm(f => ({ ...f, ticket_type: e.target.value }))}
                    className={selectCls}
                >
                    {TICKET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </Field>

            <Field label="제목 *">
                <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="예) 신세계 50만원권 구매합니다"
                    maxLength={80}
                    className={inputCls}
                />
                <p className="text-xs text-foreground-muted mt-1 text-right">{form.title.length}/80</p>
            </Field>

            <Field label="구매가">
                <label className="flex items-center gap-2 mb-3 cursor-pointer w-fit">
                    <input
                        type="checkbox"
                        checked={form.is_price_negotiable}
                        onChange={e => setForm(f => ({ ...f, is_price_negotiable: e.target.checked, buy_price: null }))}
                        className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm text-foreground">가격 협의</span>
                </label>
                {!form.is_price_negotiable && (
                    <input
                        type="number" min={0}
                        value={form.buy_price ?? ''}
                        onChange={e => setForm(f => ({ ...f, buy_price: e.target.value ? Number(e.target.value) : null }))}
                        placeholder="구매 희망 금액 (원)"
                        className={inputCls}
                    />
                )}
            </Field>

            <Field label="태그">
                <div className="flex gap-2 flex-wrap">
                    {BUY_TAGS.map(tag => (
                        <button key={tag} type="button" onClick={() => toggleTag(tag)} className={tagCls(form.tags.includes(tag))}>
                            #{tag}
                        </button>
                    ))}
                </div>
            </Field>

            <Field label="상세 내용 (선택)">
                <textarea
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    placeholder="원하는 상품권 조건 등 추가 정보를 입력하세요."
                    rows={5}
                    className={`${inputCls} resize-none`}
                />
            </Field>

            {error && <ErrorMsg msg={error} />}

            <button type="submit" disabled={submitting} className={submitCls}>
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />등록 중...</> : '구매 게시글 등록'}
            </button>
        </form>
    );
};

/* ── 공통 UI ── */
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
        <label className="block text-sm font-semibold text-foreground mb-2">{label}</label>
        {children}
    </div>
);

const ErrorMsg = ({ msg }: { msg: string }) => (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" /> {msg}
    </div>
);

const inputCls = 'w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all';
const selectCls = 'w-full px-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary transition-colors';
const submitCls = 'w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2';
const tagCls = (active: boolean) => `px-3.5 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${active ? 'bg-primary text-white border-primary' : 'bg-card text-foreground-muted border-border hover:border-primary/40'}`;
