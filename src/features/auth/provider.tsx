'use client';

import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchProfile } from './logic';
import { useAuthStore } from './store';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { setUser, closeModal } = useAuthStore();

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        supabase.auth.getSession().then(async ({ data }) => {
            if (data.session?.user) {
                const profile = await fetchProfile(data.session.user.id);
                if (profile) setUser(profile);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') { setUser(null); return; }
            if (session?.user) {
                const profile = await fetchProfile(session.user.id);
                if (profile) { setUser(profile); closeModal(); }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return <>{children}</>;
};
