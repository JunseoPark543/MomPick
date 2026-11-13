import { supabase } from '@/lib/supabase';

export type Metrics = Record<string, number>;

type RuleItem = { metric: string; min: number };
export type GradeRule = { all?: RuleItem[]; any?: RuleItem[] };

export type GradeLevel = {
  level: number;
  name: string;
  emoji: string;
  description: string;
  rule: GradeRule;
};

export const METRIC_LABELS: Record<string, string> = {
  profile_complete: '프로필·동네·아이 설정',
  food_orders: '이유식 구매',
  used_trades: '중고거래 완료',
  sterilizations: '살균 서비스 이용',
  best_posts: '베스트 글 선정',
  active_subscriptions: '정기 구독 유지',
  fact_checks: '팩트 체크 기여',
};

let cachedLevels: GradeLevel[] | null = null;

// 등급 규칙은 DB(grade_levels)에서 읽는다
export async function fetchGradeLevels(): Promise<GradeLevel[]> {
  if (cachedLevels) return cachedLevels;
  const { data } = await supabase.from('grade_levels').select('*').order('level');
  cachedLevels = (data ?? []) as GradeLevel[];
  return cachedLevels;
}

export type Condition = {
  label: string;
  current: number;
  min: number;
  done: boolean;
};

// 다음 등급까지 남은 조건 목록
export function conditionsFor(rule: GradeRule, metrics: Metrics): { mode: 'all' | 'any'; items: Condition[] } {
  const mode = rule.any ? 'any' : 'all';
  const items = (rule.any ?? rule.all ?? []).map((r) => {
    const current = metrics[r.metric] ?? 0;
    return { label: METRIC_LABELS[r.metric] ?? r.metric, current, min: r.min, done: current >= r.min };
  });
  return { mode, items };
}

export type LevelResult = {
  level: number;
  previous_level: number;
  metrics: Metrics;
};

export async function refreshMyLevel(): Promise<LevelResult | null> {
  const { data, error } = await supabase.rpc('refresh_my_level');
  if (error) return null;
  return data as LevelResult;
}
