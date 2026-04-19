import React from 'react';
import { Ticket } from 'lucide-react';
import Link from 'next/link';

const GUIDE_LINKS = [
    { label: '서비스 소개', href: '/#guide' },
    { label: '거래 가이드', href: '/#guide' },
    { label: '주의사항', href: '/#guide' },
];

const POLICY_LINKS = [
    { label: '이용약관', href: '/terms' },
    { label: '개인정보처리방침', href: '/privacy' },
];

const CS_LINKS = [
    { label: '공지사항', href: '/notices' },
    { label: '1:1 문의', href: '/chat' },
];

export const Footer = () => {
    return (
        <footer className="w-full bg-background-secondary border-t border-border mt-16">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">

                {/* 3단 컬럼 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

                    {/* 서비스 소개 */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                                <Ticket className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-base font-extrabold text-foreground">
                                티켓<span className="text-primary">가이드</span>
                            </span>
                        </div>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                            안전하고 신뢰할 수 있는<br />
                            상품권 예약판매 안내 플랫폼
                        </p>
                    </div>

                    {/* 이용안내 */}
                    <div>
                        <h4 className="text-sm font-bold text-foreground mb-3">이용안내</h4>
                        <ul className="flex flex-col gap-2">
                            {GUIDE_LINKS.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-foreground-muted hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 고객센터 */}
                    <div>
                        <h4 className="text-sm font-bold text-foreground mb-3">고객센터</h4>
                        <ul className="flex flex-col gap-2">
                            {CS_LINKS.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-foreground-muted hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 약관 및 정책 */}
                    <div>
                        <h4 className="text-sm font-bold text-foreground mb-3">약관 및 정책</h4>
                        <ul className="flex flex-col gap-2">
                            {POLICY_LINKS.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-foreground-muted hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 사업자 정보 + 저작권 */}
                <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <p className="text-xs text-foreground-muted leading-relaxed">
                        본 사이트는 상품권 예약판매 안내를 위한 정보 제공 목적으로 운영됩니다.
                    </p>
                    <p className="text-xs text-foreground-muted whitespace-nowrap">
                        © {new Date().getFullYear()} 티켓가이드. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
