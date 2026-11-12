import { supabase } from '@/lib/supabase';

export type Board = 'local' | 'cohort';
export type Category = 'question' | 'info' | 'daily' | 'recommend';
export type FactCheckStatus = 'checked' | 'caution';

export const CATEGORY_LABELS: Record<Category, string> = {
  question: '질문',
  info: '정보',
  daily: '일상',
  recommend: '추천',
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export const BOARD_LABELS: Record<Board, string> = {
  local: '동네 게시판',
  cohort: '동기 모임',
};

export type Post = {
  id: string;
  author_id: string;
  board: Board;
  category: Category;
  title: string;
  body: string;
  cohort_month: string | null;
  like_count: number;
  comment_count: number;
  best_at: string | null;
  fact_check_status: FactCheckStatus | null;
  is_hidden: boolean;
  created_at: string;
  author: { nickname: string | null } | null;
  neighborhood: { sigungu: string; dong: string };
};

// 목록·상세 화면에서 함께 가져오는 칸 (글쓴이 닉네임, 동네 이름 포함)
export const POST_COLUMNS =
  'id, author_id, board, category, title, body, cohort_month, like_count, comment_count, best_at, fact_check_status, is_hidden, created_at, author:profiles!posts_author_id_fkey(nickname), neighborhood:neighborhoods!inner(sigungu, dong)';

export type Feed = 'local' | 'all' | 'cohort';

export type FeedFilter = {
  sigungu: string | null;
  cohortMonth: string | null;
};

// 동네 탭의 글 목록 한 쪽(page)을 불러온다
export async function fetchFeed(feed: Feed, filter: FeedFilter, from: number, pageSize: number) {
  let query = supabase
    .from('posts')
    .select(POST_COLUMNS)
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  if (feed === 'local') {
    query = query.eq('board', 'local').eq('neighborhood.sigungu', filter.sigungu ?? '');
  } else if (feed === 'all') {
    query = query.eq('board', 'local');
  } else {
    query = query.eq('board', 'cohort').eq('cohort_month', filter.cohortMonth ?? '1900-01-01');
  }

  return query.returns<Post[]>();
}
