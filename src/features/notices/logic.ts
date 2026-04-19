import { supabase } from '@/lib/supabase';
import { Notice } from './types';

export async function fetchNotices(): Promise<Notice[]> {
    const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function fetchNotice(id: number): Promise<Notice | null> {
    const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return data;
}

export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}
