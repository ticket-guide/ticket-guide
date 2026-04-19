'use client';

import React, { useEffect, useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

type LayoutMode = 'pc' | 'responsive';
const STORAGE_KEY = 'layout-mode';
const TARGET_WIDTH = 1280;

export default function DesktopScaleWrapper({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<LayoutMode>('pc');

    useEffect(() => {
        const saved = (localStorage.getItem(STORAGE_KEY) as LayoutMode) || 'pc';
        setMode(saved);
        applyMode(saved);
    }, []);

    const applyMode = (m: LayoutMode) => {
        const html = document.documentElement;
        if (m === 'responsive') {
            html.classList.remove('mode-pc');
            html.classList.add('mode-responsive');
            document.body.style.zoom = '1';
        } else {
            html.classList.remove('mode-responsive');
            html.classList.add('mode-pc');
            applyPcScale();
        }
    };

    const applyPcScale = () => {
        const currentWidth = window.innerWidth;
        if (currentWidth < TARGET_WIDTH) {
            document.body.style.zoom = (currentWidth / TARGET_WIDTH).toString();
        } else {
            document.body.style.zoom = '1';
        }
    };

    useEffect(() => {
        if (mode !== 'pc') return;
        applyPcScale();
        window.addEventListener('resize', applyPcScale);
        return () => window.removeEventListener('resize', applyPcScale);
    }, [mode]);

    const toggleMode = () => {
        const next: LayoutMode = mode === 'pc' ? 'responsive' : 'pc';
        setMode(next);
        localStorage.setItem(STORAGE_KEY, next);
        applyMode(next);
    };

    return (
        <>
            {children}

            {/* 레이아웃 모드 토글 — 우측 하단 플로팅 버튼 */}
            <button
                onClick={toggleMode}
                title={mode === 'pc' ? '반응형 모드로 전환' : 'PC 스케일 모드로 전환'}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border shadow-card-md text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-all"
            >
                {mode === 'pc' ? (
                    <><Smartphone className="w-4 h-4" />반응형</>
                ) : (
                    <><Monitor className="w-4 h-4" />PC 모드</>
                )}
            </button>
        </>
    );
}
