import { ConsultingType, ConsultingOption, Company } from './types';

// 기존 호환용
export const getConsultingOptions = (): ConsultingOption[] => [
    { id: 'COUNSEL', label: '상품권 상담하기', description: '티켓가이드만의 1:1 맞춤 상담 예약 절차 안내' },
    { id: 'INQUIRY', label: '문의하기', description: '상품권 관련 24시간 실시간 문의 접수' },
    { id: 'SELL', label: '상품권 판매하기', description: '안전하고 빠른 판매를 위한 전문가 연결' },
];

export const getCompanies = (): Company[] => [
    {
        id: 'company-a',
        name: '킹 티켓',
        description: '업계 최저 수수료 보장 및 5분 내 입금',
        iconUrl: '/king-ticket.png',
        themeKey: 'blue'
    },
    {
        id: 'company-b',
        name: '에이치 티켓',
        description: '지류 상품권 대량 매입 전문, 방문 출장 가능',
        iconUrl: '/h-ticket.png',
        themeKey: 'emerald'
    },
    {
        id: 'company-c',
        name: '제이 티켓',
        description: '구글, 넥슨, 문화상품권 모바일 특화 거래소',
        iconUrl: '/j-ticket.png',
        themeKey: 'rose'
    },
    {
        id: 'company-d',
        name: '이동 티켓 1',
        description: '5년 연속 무사고 인증, VIP 전담 상담사 배정',
        iconUrl: '/move-ticket1.png',
        themeKey: 'blue'
    },
    {
        id: 'company-e',
        name: '이동 티켓 2',
        description: '신용카드 상품권 매입, 24시간 자동화 시스템',
        iconUrl: '/move-ticket2.png',
        themeKey: 'purple'
    },
    {
        id: 'company-f',
        name: '일등 티켓',
        description: '소액 티켓 현금화 및 상품권 대량 거래 전문',
        iconUrl: '/first-ticket.png',
        themeKey: 'purple'
    },
];

export const getQrCodeUrlForType = (typeId: string): string => {
    // TODO: 실제 QR 코드로 교체 (typeId가 특정 업체 ID일 경우 해당 업체의 QR을 반환)
    return `/images/qr-${typeId}.png`;
};

export const getModalTitleForType = (typeId: string): string => {
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
