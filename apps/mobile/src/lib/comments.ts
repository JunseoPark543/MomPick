import { supabase } from '@/lib/supabase';

export type Comment = {
  id: string;
  author_id: string;
  body: string;
  is_fact_check: boolean;
  source: string | null;
  is_hidden: boolean;
  created_at: string;
  author: { nickname: string | null } | null;
};

export async function fetchComments(postId: string) {
  return supabase
    .from('comments')
    .select('id, author_id, body, is_fact_check, source, is_hidden, created_at, author:profiles!comments_author_id_fkey(nickname)')
    .eq('post_id', postId)
    .order('created_at')
    .returns<Comment[]>();
}
