export type ListingType = 'buy' | 'sell';

export interface Company {
    id: number;
    name: string;
    badges: string[];
    iconUrl?: string;
    contactLink?: string;
    listingType: ListingType;
}

export interface SellPost {
    id: number;
    ticketType: string;
    title: string;
    deliveryDeadline: string;
    tags: string[];
    status: '판매중' | '판매완료';
    originalPrice?: number;
    sellPrice: number | '가격 협의';
    discountRate?: number;
    author: string;
    isVerified: boolean;
    createdAt: string;
}

export interface SellPostDB {
    id: number;
    author_id: string;
    ticket_type: string;
    title: string;
    content: string | null;
    sell_price: number | null;
    original_price: number | null;
    is_price_negotiable: boolean;
    delivery_deadline: string;
    tags: string[];
    status: '판매중' | '판매완료';
    created_at: string;
    profiles?: { nickname: string | null };
}

export interface NewSellPost {
    ticket_type: string;
    title: string;
    content: string;
    sell_price: number | null;
    original_price: number | null;
    is_price_negotiable: boolean;
    delivery_deadline: string;
    tags: string[];
}

export interface CompanyDB {
    id: number;
    owner_id: string;
    name: string;
    badges: string[];
    icon_url: string | null;
    contact_link: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface NewCompany {
    name: string;
    badges: string[];
    icon_url: string | null;
    contact_link: string | null;
}

export interface BuyPost {
    id: number;
    ticketType: string;
    title: string;
    tags: string[];
    status: '구매중' | '구매완료';
    buyPrice: number | '가격 협의';
    author: string;
    createdAt: string;
}

export interface BuyPostDB {
    id: number;
    author_id: string;
    ticket_type: string;
    title: string;
    content: string | null;
    buy_price: number | null;
    is_price_negotiable: boolean;
    tags: string[];
    status: '구매중' | '구매완료';
    created_at: string;
    profiles?: { nickname: string | null };
}

export interface NewBuyPost {
    ticket_type: string;
    title: string;
    content: string;
    buy_price: number | null;
    is_price_negotiable: boolean;
    tags: string[];
}
