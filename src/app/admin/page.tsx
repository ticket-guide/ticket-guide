'use client';

import { Suspense } from 'react';
import { AdminContent } from '@/features/admin/components';

export default function AdminPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-foreground-muted text-sm">로딩 중...</div>}>
            <AdminContent />
        </Suspense>
    );
}
