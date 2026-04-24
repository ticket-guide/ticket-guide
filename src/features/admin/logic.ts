import { supabase } from '@/lib/supabase';
import { MemberRow } from './types';

export async function fetchAllMembers(): Promise<MemberRow[]> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, user_type, is_admin, created_at')
        .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as MemberRow[];
}

export async function setAdminStatus(userId: string, isAdmin: boolean) {
    return supabase.from('profiles').update({ is_admin: isAdmin }).eq('id', userId);
}

export async function deleteUserById(userId: string) {
    return supabase.rpc('delete_user_by_id', { target_user_id: userId });
}

export function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
