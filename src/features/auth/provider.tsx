'use client';

import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchProfile } from './logic';
import { useAuthStore } from './store';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { setUser, closeModal } = useAuthStore();

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') { setUser(null); return; }
            if (!session?.user) return;

            const { id, email } = session.user;
            // setTimeout(0)으로 onAuthStateChange lock 해제 후 실행
            // — 콜백 내부에서 supabase 쿼리 시 getSession()이 lock을 재획득해 deadlock 발생하는 문제 방지
            setTimeout(async () => {
                const profile = await fetchProfile(id, email);
                if (profile) { setUser(profile); if (event !== 'INITIAL_SESSION') closeModal(); }
            }, 0);
        });

        return () => subscription.unsubscribe();
    }, []);

    return <>{children}</>;
};
