import type { Metadata, Viewport } from 'next';
import './globals.css';
import DesktopScaleWrapper from './DesktopScaleWrapper';

export const viewport: Viewport = {
    themeColor: '#18181b', // zinc-900 
    width: 1280,
    initialScale: 0.1,    // 브라우저 렌더링 엔진이 강제로 넓은 영역을 한 화면에 줌아웃하도록 최소 배율로 던짐
    maximumScale: 10,     // 유저가 임의로 확대 축소하는 건 가능하게
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
                <DesktopScaleWrapper>
                    <main className="min-h-screen min-w-[1280px] w-[1280px] mx-auto overflow-hidden">
                        {children}
                    </main>
                </DesktopScaleWrapper>
            </body>
        </html>
    );
}
