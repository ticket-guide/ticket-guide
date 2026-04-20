import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// .env.local에 실제 값이 있는지 확인 — UI에서 미설정 경고 표시용
export const isSupabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Auth 포함 클라이언트 (로그인/채팅 등 인증 필요 작업용)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 공개 데이터 전용 클라이언트 (auth lock 없이 즉시 쿼리 — 업체목록, 게시판, 공지사항)
// no-op storage로 localStorage를 건드리지 않아 lock 경합 및 Multiple GoTrueClient 경고 제거
const noopStorage = {
    getItem: (_key: string) => null,
    setItem: (_key: string, _value: string) => {},
    removeItem: (_key: string) => {},
};

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: noopStorage,
        storageKey: 'sb-public-noop',  // 별도 key로 lock 충돌 및 Multiple GoTrueClient 경고 제거
    },
});
