import { ConsultingType, ConsultingOption } from './types';

// 순수 로직 함수: 외부 의존성(상태, UI 등)이 없는 순수 함수들
export const getConsultingOptions = (): ConsultingOption[] => [
    { id: 'COUNSEL', label: '상품권 상담하기', description: '티켓가이드만의 1:1 맞춤 상담 예약 절차 안내' },
    { id: 'INQUIRY', label: '문의하기', description: '상품권 관련 24시간 실시간 문의 접수' },
    { id: 'SELL', label: '상품권 판매하기', description: '안전하고 빠른 판매를 위한 전문가 연결' },
];

export const getQrCodeUrlForType = (type: ConsultingType): string => {
    // TODO: 실제 QR 코드로 교체
    switch (type) {
        case 'COUNSEL':
            return '/images/qr-counsel.png'; // 예시: 네이버 라인 QR
        case 'INQUIRY':
            return '/images/qr-inquiry.png'; // 예시: 카카오톡 채널 QR
        case 'SELL':
            return '/images/qr-sell.png'; // 예시: 카카오톡 상담 QR
        default:
            return '';
    }
};

export const getModalTitleForType = (type: ConsultingType): string => {
    switch (type) {
        case 'COUNSEL': return '1:1 맞춤 상담 연결';
        case 'INQUIRY': return '실시간 상담 문의';
        case 'SELL': return '신속한 판매 상담 연결';
        default: return '상담 안내';
    }
};
