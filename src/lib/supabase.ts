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
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
    },
});
