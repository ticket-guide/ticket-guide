import { CompanyListSection, ConsultingQrModal } from '@/features/ticket-consulting/components';

export default function Home() {
    return (
        <div className="flex flex-col gap-10 animate-fade-in">
            <CompanyListSection />
            <ConsultingQrModal />
        </div>
    );
}
