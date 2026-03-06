// 상담/문의/판매 등에 사용되는 타입들
export type ConsultingType = 'COUNSEL' | 'INQUIRY' | 'SELL';

// 임시: 기존 단순 버튼에서 더 이상 사용하지 않지만 로우레벨 호환을 위해 남겨둠
export interface ConsultingOption {
    id: ConsultingType;
    label: string;
    description: string;
}

export interface Company {
    id: number;             // 모달 분기용 고유 숫자 ID
    name: string;           // 업체명
    badges: string[];       // 카드 내에 표시될 뱃지 텍스트 배열 (예: ['정식사업자', '빠른 상담'])
    iconUrl?: string;       // 업체 타이틀 옆 아이콘 (왕관/엠블럼 등)
    themeKey?: 'blue' | 'purple' | 'emerald' | 'rose' | 'amber'; // 카드 색상 테마
    contactLink?: string;   // 클릭 시 바로 이동할 외부 메신저 링크 (예: 라인 딥링크)
}

export interface ConsultingState {
    isModalOpen: boolean;
    selectedType: string | number | null;
}
