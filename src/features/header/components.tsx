'use client';

import React, { useState } from 'react';
import { Menu, X, Bell, LogIn, Ticket, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/store';
import { UserAvatarButton } from '@/features/auth/components';

const NAV_LINKS = [
    { label: '공지사항', href: '/notices', icon: Bell },
    { label: '채팅', href: '/chat', icon: MessageCircle },
];

export const Header = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { openModal, user } = useAuthStore();

    return (
        <header className="sticky top-0 z-40 w-full bg-card border-b border-border shadow-card">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

                {/* 로고 */}
                <Link href="/" className="flex items-center gap-2 shrink-0 group">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:bg-primary-dark transition-colors">
                        <Ticket className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-extrabold text-foreground tracking-tight">
                        티켓<span className="text-primary">가이드</span>
                    </span>
                </Link>

                {/* PC 네비게이션 */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link key={link.href} href={link.href}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-foreground-muted hover:text-primary hover:bg-primary-light transition-colors">
                                <Icon className="w-4 h-4" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* PC 우측 */}
                <div className="hidden md:flex items-center gap-2">
                    {user ? (
                        <UserAvatarButton />
                    ) : (
                        <>
                            <button onClick={() => openModal('login')}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-primary border border-primary hover:bg-primary-light transition-colors">
                                <LogIn className="w-4 h-4" />
                                로그인
                            </button>
                            <button onClick={() => openModal('signup')}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-colors shadow-sm">
                                회원가입
                            </button>
                        </>
                    )}
                </div>

                {/* 모바일 햄버거 */}
                <button
                    className="md:hidden p-2 rounded-lg text-foreground-muted hover:bg-background-secondary transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="메뉴 열기"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* 모바일 드롭다운 */}
            {mobileOpen && (
                <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-2 animate-fade-in">
                    {NAV_LINKS.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link key={link.href} href={link.href}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-background-secondary transition-colors"
                                onClick={() => setMobileOpen(false)}>
                                <Icon className="w-4 h-4 text-primary" />
                                {link.label}
                            </Link>
                        );
                    })}
                    <div className="flex gap-2 mt-1 pt-2 border-t border-border">
                        {user ? (
                            <div className="flex-1"><UserAvatarButton /></div>
                        ) : (
                            <>
                                <button onClick={() => { openModal('login'); setMobileOpen(false); }}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-primary border border-primary hover:bg-primary-light transition-colors">
                                    로그인
                                </button>
                                <button onClick={() => { openModal('signup'); setMobileOpen(false); }}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-colors">
                                    회원가입
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};
