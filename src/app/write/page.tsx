'use client';

import { Suspense } from 'react';
import { WriteContent } from '@/features/write/components';

export default function WritePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-foreground-muted text-sm">로딩 중...</div>}>
            <WriteContent />
        </Suspense>
    );
}
