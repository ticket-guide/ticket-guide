import type { Metadata, Viewport } from 'next';
import './globals.css';
import DesktopScaleWrapper from './DesktopScaleWrapper';
import { Header } from '@/features/header/components';
import { Footer } from '@/features/footer/components';
import { AuthModal } from '@/features/auth/components';
import { AuthProvider } from '@/features/auth/provider';

export const viewport: Viewport = {
    themeColor: '#2563EB',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
};

export const metadata: Metadata = {
    title: '상품권 판매 안내 가이드',
    description: '디지털/지류 상품권 구매 및 판매 상담을 위한 전문 가이드 페이지입니다.',
    icons: {
        icon: '/icon.svg',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <body>
                <AuthProvider>
                    <DesktopScaleWrapper>
                        <div className="flex flex-col min-h-screen">
                            <Header />
                            <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
                                {children}
                            </main>
                            <Footer />
                            <AuthModal />
                        </div>
                    </DesktopScaleWrapper>
                </AuthProvider>
            </body>
        </html>
    );
}
