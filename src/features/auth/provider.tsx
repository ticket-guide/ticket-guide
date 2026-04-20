'use client';

import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchProfile } from './logic';
import { useAuthStore } from './store';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { setUser, closeModal } = useAuthStore();

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        // getSession()을 별도로 호출하지 않음 — onAuthStateChange의 INITIAL_SESSION 이벤트가 초기 세션을 처리
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') { setUser(null); return; }
            if (session?.user) {
                const profile = await fetchProfile(session.user.id, session.user.email);
                if (profile) { setUser(profile); if (event !== 'INITIAL_SESSION') closeModal(); }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return <>{children}</>;
};
