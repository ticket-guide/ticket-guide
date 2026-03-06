'use client';

import React, { useEffect } from 'react';

export default function DesktopScaleWrapper({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const adjustScale = () => {
            const TARGET_WIDTH = 1280;
            const currentWidth = window.innerWidth;

            if (currentWidth < TARGET_WIDTH) {
                // 모바일 환경일 때 1280px 기준으로 화면을 축소 계산
                const scaleRatio = currentWidth / TARGET_WIDTH;
                const body = document.body;

                // CSS Variable, zoom, 혹은 transform 지정
                body.style.zoom = scaleRatio.toString(); // Safari 일부 버전 제외 대부분 적용됨
                // 만약 zoom이 먹어버리는 사파리 대응 필요 시 아래 로직 적용 (transform)
                // body.style.transform = `scale(${scaleRatio})`;
                // body.style.transformOrigin = 'top left';
                // body.style.width = `${TARGET_WIDTH}px`;
            } else {
                // PC 환경은 원래대로 복구
                document.body.style.zoom = '1';
                // document.body.style.transform = 'none';
                // document.body.style.width = '100%';
            }
        };

        adjustScale();
        window.addEventListener('resize', adjustScale);

        return () => {
            window.removeEventListener('resize', adjustScale);
        };
    }, []);

    return <>{children}</>;
}
