import { Company, SellPost, SellPostDB, NewSellPost, CompanyDB, NewCompany, BuyPost, BuyPostDB, NewBuyPost } from './types';
import { supabase } from '@/lib/supabase';

const pad = (n: number) => String(n).padStart(2, '0');
const formatTs = (ts: string) => {
    const d = new Date(ts);
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/* ── Companies ── */

export const fetchCompaniesFromDB = async (): Promise<Company[]> => {
    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
    if (error || !data) return [];
    return (data as CompanyDB[]).map((c) => ({
        id: c.id,
        name: c.name,
        badges: c.badges ?? [],
        iconUrl: c.icon_url ?? undefined,
        contactLink: c.contact_link ?? undefined,
        listingType: 'buy' as const,
    }));
};

export const fetchMyCompany = async (ownerId: string): Promise<CompanyDB | null> => {
    const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', ownerId)
        .maybeSingle();
    return (data as CompanyDB) ?? null;
};

export const fetchAllCompaniesAdmin = async (): Promise<CompanyDB[]> => {
    const { data } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: true });
    return (data as CompanyDB[]) ?? [];
};

export const upsertCompany = async (ownerId: string, company: NewCompany, companyId?: number) => {
    if (companyId) {
        return supabase.from('companies').update({
            name: company.name,
            badges: company.badges,
            icon_url: company.icon_url,
            contact_link: company.contact_link,
            updated_at: new Date().toISOString(),
        }).eq('id', companyId);
    }
    return supabase.from('companies').insert({
        owner_id: ownerId,
        name: company.name,
        badges: company.badges,
        icon_url: company.icon_url,
        contact_link: company.contact_link,
    });
};

export const toggleCompanyActive = async (companyId: number, isActive: boolean) => {
    return supabase.from('companies').update({ is_active: isActive, updated_at: new Date().toISOString() }).eq('id', companyId);
};

export const uploadCompanyImage = async (file: File, ownerId: string): Promise<string | null> => {
    const ext = file.name.split('.').pop() ?? 'png';
    const path = `${ownerId}/logo.${ext}`;
    const { error } = await supabase.storage
        .from('company-images')
        .upload(path, file, { upsert: true, contentType: file.type });
    if (error) return null;
    const { data } = supabase.storage.from('company-images').getPublicUrl(path);
    return `${data.publicUrl}?t=${Date.now()}`;
};

/* ── Sell Posts ── */

const dbPostToSellPost = (p: SellPostDB): SellPost => ({
    id: p.id,
    ticketType: p.ticket_type,
    title: p.title,
    deliveryDeadline: p.delivery_deadline,
    tags: (p.tags ?? []).map((t) => `#${t}`),
    status: p.status,
    originalPrice: p.original_price ?? undefined,
    sellPrice: p.is_price_negotiable ? '가격 협의' : (p.sell_price ?? 0),
    discountRate: p.original_price && p.sell_price
        ? Math.round((1 - p.sell_price / p.original_price) * 100)
        : undefined,
    author: p.profiles?.nickname ?? '익명',
    isVerified: false,
    createdAt: formatTs(p.created_at),
});

export const fetchSellPostsFromDB = async (): Promise<SellPost[]> => {
    const { data, error } = await supabase
        .from('sell_posts')
        .select('*, profiles(nickname)')
        .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as SellPostDB[]).map(dbPostToSellPost);
};

export const createSellPost = async (authorId: string, post: NewSellPost) => {
    return supabase.from('sell_posts').insert({
        author_id: authorId,
        ticket_type: post.ticket_type,
        title: post.title,
        content: post.content,
        sell_price: post.sell_price,
        original_price: post.original_price,
        is_price_negotiable: post.is_price_negotiable,
        delivery_deadline: post.delivery_deadline,
        tags: post.tags,
    });
};

/* ── Buy Posts ── */

const dbPostToBuyPost = (p: BuyPostDB): BuyPost => ({
    id: p.id,
    ticketType: p.ticket_type,
    title: p.title,
    tags: (p.tags ?? []).map((t) => `#${t}`),
    status: p.status,
    buyPrice: p.is_price_negotiable ? '가격 협의' : (p.buy_price ?? 0),
    author: p.profiles?.nickname ?? '익명',
    createdAt: formatTs(p.created_at),
});

export const fetchBuyPostsFromDB = async (): Promise<BuyPost[]> => {
    const { data, error } = await supabase
        .from('buy_posts')
        .select('*, profiles(nickname)')
        .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as BuyPostDB[]).map(dbPostToBuyPost);
};

export const createBuyPost = async (authorId: string, post: NewBuyPost) => {
    return supabase.from('buy_posts').insert({
        author_id: authorId,
        ticket_type: post.ticket_type,
        title: post.title,
        content: post.content,
        buy_price: post.buy_price,
        is_price_negotiable: post.is_price_negotiable,
        tags: post.tags,
    });
};
