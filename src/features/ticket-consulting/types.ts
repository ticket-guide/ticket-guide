// 상담/문의/판매 등에 사용되는 타입들
export type ConsultingType = 'COUNSEL' | 'INQUIRY' | 'SELL';

export interface ConsultingOption {
    id: ConsultingType;
    label: string;
    description: string;
}

export interface ConsultingState {
    isModalOpen: boolean;
    selectedType: ConsultingType | null;
}
