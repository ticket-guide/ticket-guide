import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: '상품권 안내 가이드',
    description: '디지털/지류 상품권 구매 및 판매 상담을 위한 전문 가이드 페이지입니다.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <body>
                <main className="min-h-screen">
                    {children}
                </main>
            </body>
        </html>
    );
}
