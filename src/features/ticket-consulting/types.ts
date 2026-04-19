// 상담/문의/판매 등에 사용되는 타입들
export type ConsultingType = 'COUNSEL' | 'INQUIRY' | 'SELL';

// 임시: 기존 단순 버튼에서 더 이상 사용하지 않지만 로우레벨 호환을 위해 남겨둠
export interface ConsultingOption {
    id: ConsultingType;
    label: string;
    description: string;
}

export type ListingType = 'buy' | 'sell';

export interface Company {
    id: number;
    name: string;
    badges: string[];
    iconUrl?: string;          // 카드 배경 이미지 겸 아이콘
    themeKey?: 'blue' | 'purple' | 'emerald' | 'rose' | 'amber';
    contactLink?: string;
    listingType: ListingType;  // 'buy' = 삽니다(업체가 상품권 매입), 'sell' = 팝니다
}

export interface SellPost {
    id: number;
    ticketType: string;         // 신세계, 롯데, 문화상품권 등
    title: string;              // 게시글 제목
    deliveryDeadline: string;   // 발송기한 (예: '7일 이내 발송')
    tags: string[];             // #전국 #모바일 등
    status: '판매중' | '판매완료';
    originalPrice?: number;     // 원가 (취소선)
    sellPrice: number | '가격 협의';
    discountRate?: number;      // 할인율 (%)
    author: string;
    isVerified: boolean;
    createdAt: string;          // 'YYYY.MM.DD HH:mm'
}

export interface ConsultingState {
    isModalOpen: boolean;
    selectedType: string | number | null;
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
