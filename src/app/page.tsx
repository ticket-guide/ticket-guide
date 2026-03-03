import { ConsultingButtons, ConsultingQrModal } from '@/features/ticket-consulting/components';
import { GuideContentSection } from '@/features/guide-content/components';

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 items-center text-center animate-fade-in w-full max-w-4xl">
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-primary">
                    상품권 안내 가이드
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl bg-white/50 dark:bg-black/50 p-6 rounded-2xl glass-effect shadow-sm">
                    안전하고 빠르고 믿을 수 있는 상품권 거래의 모든 것. <br className="hidden sm:block" />
                    지금 바로 전문가와 무료 상담을 시작해 보세요.
                </p>

                {/* 상담/판매/문의 기능 버튼 모음 */}
                <ConsultingButtons />

                {/* 설명 가이드 콘텐츠 섹션 */}
                <GuideContentSection />

                {/* 선택 시 나타나는 QR 코드 모달 */}
                <ConsultingQrModal />
            </main>
        </div>
    );
}
