import { Suspense } from 'react';
import { NoticesContent } from '@/features/notices/components';
import { Loader2 } from 'lucide-react';

export default function NoticesPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20 gap-2 text-foreground-muted">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">불러오는 중...</span>
            </div>
        }>
            <NoticesContent />
        </Suspense>
    );
}
