import { ConsultingType, ConsultingOption, Company } from './types';

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
            contactLink: 'https://line.me/ti/p/~ticket2387'
        },
        {
            id: 2,
            name: '이동 티켓 2 - 김실장',
            badges: ['정식사업자 업체 등록', '빠른 상담'],
            iconUrl: '/move-ticket2.png',
            themeKey: 'purple',
            contactLink: 'https://line.me/ti/p/~kim2dong'
        },
        {
            id: 3,
            name: '킹 티켓',
            badges: ['정식사업자 업체 등록', '빠른 상담'],
            iconUrl: '/king-ticket.png',
            themeKey: 'blue',
            contactLink: 'https://line.me/ti/p/~kingticket12'
        },
        {
            id: 4,
            name: '이동 티켓 1 - 이대표',
            badges: ['정식사업자 업체 등록', '빠른 상담'],
            iconUrl: '/move-ticket1.png',
            themeKey: 'blue',
            contactLink: 'https://line.me/ti/p/~2dongtk'
        },
        {
            id: 5,
            name: '제이 티켓',
            badges: ['정식사업자 업체 등록', '빠른 상담'],
            iconUrl: '/j-ticket.png',
            themeKey: 'rose',
            contactLink: 'https://line.me/ti/p/~jticket'
        },
        {
            id: 6,
            name: '에이치 티켓',
            badges: ['정식사업자 업체 등록', '빠른 상담'],
            iconUrl: '/h-ticket.png',
            themeKey: 'emerald',
            contactLink: 'https://line.me/ti/p/~HO4929'
        },
    ];
    // id 오름차순(int 기준) 정렬하여 반환
    return companies.sort((a, b) => a.id - b.id);
};

export const getQrCodeUrlForType = (typeId: string | number): string => {
    // TODO: 실제 QR 코드로 교체 (typeId가 특정 업체 ID일 경우 해당 업체의 QR을 반환)
    return `/images/qr-${typeId}.png`;
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
