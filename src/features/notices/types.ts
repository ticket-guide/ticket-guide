export interface Notice {
    id: number;
    title: string;
    content: string;
    is_pinned: boolean;
    author_id: string | null;
    created_at: string;
}
