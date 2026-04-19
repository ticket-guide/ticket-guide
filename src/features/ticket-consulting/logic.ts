import { ConsultingType, ConsultingOption, Company, SellPost, SellPostDB, NewSellPost } from './types';
import { supabase } from '@/lib/supabase';

// 기존 호환용
export const getConsultingOptions = (): ConsultingOption[] => [
    { id: 'COUNSEL', label: '상품권 상담하기', description: '티켓가이드만의 1:1 맞춤 상담 예약 절차 안내' },
    { id: 'INQUIRY', label: '문의하기', description: '상품권 관련 24시간 실시간 문의 접수' },
    { id: 'SELL', label: '상품권 판매하기', description: '안전하고 빠른 판매를 위한 전문가 연결' },
];

export const getCompanies = (): Company[] => {
    const companies: Company[] = [
        {
            id: 1,
            name: '일등 티켓',
            badges: ['정식사업자 업체 등록', '빠른 상담'],
            iconUrl: '/first-ticket.png',
            themeKey: 'purple',
            contactLink: 'https://line.me/ti/p/~ticket2387',
            listingType: 'buy',
        },
        {
            id: 2,
            name: '이동 티켓 2 - 김실장',
            badges: ['정식사업자 업체 등록', '빠른 상담'],
            iconUrl: '/move-ticket2.png',
            themeKey: 'purple',
            contactLink: 'https://line.me/ti/p/~kim2dong',
            listingType: 'buy',
        },
        {
            id: 3,
            name: '킹 티켓',
            badges: ['정식사업자 업체 등록', '빠른 상담'],
            iconUrl: '/king-ticket.png',
            themeKey: 'blue',
            contactLink: 'https://line.me/ti/p/~kingticket12',
            listingType: 'buy',
        },
        {
            id: 4,
            name: '이동 티켓 1 - 이대표',
            badges: ['정식사업자 업체 등록', '빠른 상담'],
            iconUrl: '/move-ticket1.png',
            themeKey: 'blue',
            contactLink: 'https://line.me/ti/p/~2dongtk',
            listingType: 'buy',
        },
        {
            id: 5,
            name: '제이 티켓',
            badges: ['정식사업자 업체 등록', '빠른 상담'],
            iconUrl: '/j-ticket.png',
            themeKey: 'rose',
            contactLink: 'https://line.me/ti/p/~jticket',
            listingType: 'buy',
        },
        {
            id: 6,
            name: '에이치 티켓',
            badges: ['정식사업자 업체 등록', '빠른 상담'],
            iconUrl: '/h-ticket.png',
            themeKey: 'emerald',
            contactLink: 'https://line.me/ti/p/~HO4929',
            listingType: 'buy',
        },
    ];
    return companies.sort((a, b) => a.id - b.id);
};

export const getSellPosts = (): SellPost[] => [
    {
        id: 1,
        ticketType: '신세계',
        title: '신세계 50만원권 판매',
        deliveryDeadline: '7일 이내 발송',
        tags: ['#전국', '#모바일'],
        status: '판매중',
        originalPrice: 500000,
        sellPrice: 330000,
        discountRate: 34,
        author: '홍길동',
        isVerified: true,
        createdAt: '2026.04.17 10:20',
    },
    {
        id: 2,
        ticketType: '신세계',
        title: '신세계 30만원권 판매',
        deliveryDeadline: '14일 이내 발송',
        tags: ['#전국', '#모바일'],
        status: '판매중',
        originalPrice: 300000,
        sellPrice: 200000,
        discountRate: 33,
        author: '김철수',
        isVerified: false,
        createdAt: '2026.04.16 21:28',
    },
    {
        id: 3,
        ticketType: '롯데',
        title: '롯데 100만원권 판매 (가격 협의)',
        deliveryDeadline: '즉시 발송',
        tags: ['#전국', '#택배가능', '#모바일'],
        status: '판매중',
        sellPrice: '가격 협의',
        author: '이영희',
        isVerified: true,
        createdAt: '2026.04.16 14:52',
    },
    {
        id: 4,
        ticketType: '신세계',
        title: '신세계 70만원권 판매',
        deliveryDeadline: '10일 이내 발송',
        tags: ['#전국'],
        status: '판매중',
        originalPrice: 700000,
        sellPrice: 490000,
        discountRate: 30,
        author: '박민준',
        isVerified: true,
        createdAt: '2026.04.15 16:44',
    },
    {
        id: 5,
        ticketType: '문화상품권',
        title: '문화상품권 20만원권 판매',
        deliveryDeadline: '3일 이내 발송',
        tags: ['#전국', '#모바일'],
        status: '판매완료',
        originalPrice: 200000,
        sellPrice: 138000,
        discountRate: 31,
        author: '최지수',
        isVerified: false,
        createdAt: '2026.04.14 09:11',
    },
];

export const getQrCodeUrlForType = (typeId: string | number): string => {
    // TODO: 실제 QR 코드로 교체 (typeId가 특정 업체 ID일 경우 해당 업체의 QR을 반환)
    return `/images/qr-${typeId}.png`;
};

const dbPostToSellPost = (p: SellPostDB): SellPost => {
    const discountRate =
        p.original_price && p.sell_price
            ? Math.round((1 - p.sell_price / p.original_price) * 100)
            : undefined;
    const d = new Date(p.created_at);
    const pad = (n: number) => String(n).padStart(2, '0');
    const createdAt = `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return {
        id: p.id,
        ticketType: p.ticket_type,
        title: p.title,
        deliveryDeadline: p.delivery_deadline,
        tags: (p.tags ?? []).map((t) => `#${t}`),
        status: p.status,
        originalPrice: p.original_price ?? undefined,
        sellPrice: p.is_price_negotiable ? '가격 협의' : (p.sell_price ?? 0),
        discountRate,
        author: p.profiles?.nickname ?? '익명',
        isVerified: false,
        createdAt,
    };
};

export const fetchSellPostsFromDB = async (): Promise<SellPost[]> => {
    const { data, error } = await supabase
        .from('sell_posts')
        .select('*, profiles(nickname)')
        .order('created_at', { ascending: false });
    if (error || !data) return getSellPosts();
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

export const getModalTitleForType = (typeId: string | number): string => {
    const companies = getCompanies();
    const company = companies.find(c => c.id === typeId);
    if (company) {
        return `${company.name} 상담 연결`;
    }

    switch (typeId as ConsultingType) {
        case 'COUNSEL': return '1:1 맞춤 상담 연결';
        case 'INQUIRY': return '실시간 상담 문의';
        case 'SELL': return '신속한 판매 상담 연결';
        default: return '상담 안내';
    }
};
