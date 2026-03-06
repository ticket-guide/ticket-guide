// 상담/문의/판매 등에 사용되는 타입들
export type ConsultingType = 'COUNSEL' | 'INQUIRY' | 'SELL';

// 임시: 기존 단순 버튼에서 더 이상 사용하지 않지만 로우레벨 호환을 위해 남겨둠
export interface ConsultingOption {
    id: ConsultingType;
    label: string;
    description: string;
}

export interface Company {
    id: string;             // 모달 분기용 고유 ID
    name: string;           // 업체명
    description: string;    // 한줄 설명
    iconUrl?: string;       // 업체 타이틀 옆 아이콘 (왕관/엠블럼 등)
    themeKey?: 'blue' | 'purple' | 'emerald' | 'rose' | 'amber'; // 카드 색상 테마
}

export interface ConsultingState {
    isModalOpen: boolean;
    selectedType: string | null;
}
