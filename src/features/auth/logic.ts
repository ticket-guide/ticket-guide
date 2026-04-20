import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserProfile, UserType } from './types';

export async function signIn(email: string, password: string): Promise<UserProfile> {
    if (!isSupabaseConfigured) throw new Error('Supabase가 설정되지 않았습니다. .env.local을 확인해주세요.');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(translateAuthError(error.message));

    // email을 직접 전달해 getUser() 호출(lock 재획득) 방지
    const profile = await fetchProfile(data.user.id, email);
    return profile ?? { id: data.user.id, email, nickname: email.split('@')[0], userType: 'buyer', isAdmin: false };
}

export async function signUp(email: string, password: string, nickname: string, userType: UserType): Promise<UserProfile> {
    if (!isSupabaseConfigured) throw new Error('Supabase가 설정되지 않았습니다. .env.local을 확인해주세요.');

    const { data: existing } = await supabase.from('profiles').select('id').eq('nickname', nickname).maybeSingle();
    if (existing) throw new Error('이미 사용 중인 닉네임입니다.');

    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { nickname } } });
    if (error) throw new Error(translateAuthError(error.message));
    if (!data.user) throw new Error('회원가입에 실패했습니다.');

    return { id: data.user.id, email, nickname, userType, isAdmin: false };
}

export async function signOut(): Promise<void> {
    await supabase.auth.signOut();
}

// email을 직접 받아 supabase.auth.getUser() 호출을 피함 (onAuthStateChange 내부에서 lock 재획득 방지)
export async function fetchProfile(userId: string, email?: string): Promise<UserProfile | null> {
    const { data } = await supabase
        .from('profiles')
        .select('id, nickname, user_type, is_admin')
        .eq('id', userId)
        .single();

    if (!data) return null;

    const resolvedEmail = email ?? (await supabase.auth.getUser()).data.user?.email ?? '';
    return {
        id: data.id,
        email: resolvedEmail,
        nickname: data.nickname,
        userType: data.user_type as UserType,
        isAdmin: data.is_admin ?? false,
    };
}

function translateAuthError(msg: string): string {
    if (msg.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.';
    if (msg.includes('Email not confirmed')) return '이메일 인증이 필요합니다. 메일함을 확인해주세요.';
    if (msg.includes('User already registered')) return '이미 가입된 이메일입니다.';
    if (msg.includes('Password should be at least')) return '비밀번호는 6자 이상이어야 합니다.';
    return msg;
}
