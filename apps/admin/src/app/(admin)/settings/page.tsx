"use client";

import { COUPON_KIND_LABELS, FUNDED_BY_LABELS, label, type Json } from "@mompick/shared";
import { useState } from "react";

import { Badge, Button, Card, ErrorText, Loading, PageTitle } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { unwrap, useLoad } from "@/lib/useLoad";

type Setting = { key: string; value: Json; description: string };
type Grade = { level: number; name: string; emoji: string; description: string; rule: Json };
type Coupon = {
  id: string;
  name: string;
  kind: string;
  value: number;
  min_order: number;
  grant_level: number | null;
  funded_by: string;
  seller_share_pct: number;
  is_active: boolean;
};

type Data = { settings: Setting[]; grades: Grade[]; coupons: Coupon[] };

// 운영 설정: 설정값 / 등급 조건 / 쿠폰 켜기·끄기 (모두 앱에 바로 반영, 변경은 작업 기록에 남음)
export default function SettingsPage() {
  const [actionError, setActionError] = useState("");
  const [saved, setSaved] = useState("");
  const { data, error, loading, reload } = useLoad<Data>(async () => {
    const sb = supabase();
    const [settings, grades, coupons] = await Promise.all([
      sb.from("app_settings").select("key, value, description").order("key"),
      sb.from("grade_levels").select("level, name, emoji, description, rule").order("level"),
      sb
        .from("coupon_templates")
        .select("id, name, kind, value, min_order, grant_level, funded_by, seller_share_pct, is_active")
        .order("grant_level"),
    ]);
    return { settings: unwrap(settings), grades: unwrap(grades), coupons: unwrap(coupons) };
  });

  async function run(action: PromiseLike<{ error: { message: string } | null }>, message: string) {
    setActionError("");
    setSaved("");
    const { error: e } = await action;
    if (e) return setActionError(e.message);
    setSaved(message);
    reload();
  }

  function parseJson(text: string): Json | undefined {
    try {
      return JSON.parse(text) as Json;
    } catch {
      setActionError("값 형식이 올바르지 않아요. 숫자는 그대로(예: 10), 글자는 따옴표, 목록은 {…} 형식으로 적어 주세요.");
      return undefined;
    }
  }

  return (
    <>
      <PageTitle title="운영 설정" description="바꾸면 앱에 바로 반영되고, 누가 언제 바꿨는지 작업 기록에 남아요." />
      <ErrorText>{error || actionError}</ErrorText>
      {saved ? <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{saved}</p> : null}
      {loading && !data ? <Loading /> : null}

      {data ? (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-bold">설정값</h2>
            <div className="space-y-2">
              {data.settings.map((s) => (
                <SettingRow
                  key={s.key}
                  setting={s}
                  onSave={(text) => {
                    const value = parseJson(text);
                    if (value !== undefined) {
                      run(supabase().from("app_settings").update({ value }).eq("key", s.key), `'${s.key}' 저장했어요.`);
                    }
                  }}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">등급 조건</h2>
            <p className="mb-3 text-sm text-muted">
              조건 규칙 형식: {"{"}&quot;all&quot;: [...]{"}"} 은 모두 만족, {"{"}&quot;any&quot;: [...]{"}"} 은 하나만 만족. 항목은{" "}
              {"{"}&quot;metric&quot;: &quot;food_orders&quot;, &quot;min&quot;: 1{"}"} 처럼 적어요.
            </p>
            <div className="grid gap-3 lg:grid-cols-2">
              {data.grades.map((g) => (
                <GradeCard
                  key={g.level}
                  grade={g}
                  onSave={(description, ruleText) => {
                    const rule = parseJson(ruleText);
                    if (rule !== undefined) {
                      run(
                        supabase().from("grade_levels").update({ description, rule }).eq("level", g.level),
                        `Lv.${g.level} ${g.name} 조건을 저장했어요.`,
                      );
                    }
                  }}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">등급 쿠폰</h2>
            <div className="space-y-2">
              {data.coupons.map((c) => (
                <Card key={c.id} className="flex flex-wrap items-center gap-3 !p-4">
                  <Badge tone="brand">{c.grant_level ? `Lv.${c.grant_level}` : "수동"}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-muted">
                      {label(COUPON_KIND_LABELS, c.kind)} · {c.kind.endsWith("percent") ? `${c.value}%` : `${c.value.toLocaleString()}원`}
                      {c.min_order > 0 ? ` · ${c.min_order.toLocaleString()}원 이상` : ""} · {label(FUNDED_BY_LABELS, c.funded_by)}
                      {c.funded_by !== "platform" ? ` (업체 ${c.seller_share_pct}%)` : ""}
                    </p>
                  </div>
                  <Button
                    variant={c.is_active ? "secondary" : "primary"}
                    onClick={() =>
                      run(
                        supabase().from("coupon_templates").update({ is_active: !c.is_active }).eq("id", c.id),
                        `'${c.name}' 을(를) ${c.is_active ? "껐어요. 새로 지급되지 않아요" : "켰어요"}.`,
                      )
                    }>
                    {c.is_active ? "끄기" : "켜기"}
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function SettingRow({ setting, onSave }: { setting: Setting; onSave: (text: string) => void }) {
  const [text, setText] = useState(JSON.stringify(setting.value));
  const changed = text !== JSON.stringify(setting.value);
  return (
    <Card className="flex flex-wrap items-center gap-3 !p-4">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm font-semibold">{setting.key}</p>
        <p className="text-xs text-muted">{setting.description}</p>
      </div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-64 rounded-lg border border-line px-3 py-1.5 font-mono text-sm"
      />
      <Button variant="primary" disabled={!changed} onClick={() => onSave(text)}>
        저장
      </Button>
    </Card>
  );
}

function GradeCard({ grade, onSave }: { grade: Grade; onSave: (description: string, ruleText: string) => void }) {
  const [description, setDescription] = useState(grade.description);
  const [rule, setRule] = useState(JSON.stringify(grade.rule, null, 2));
  return (
    <Card>
      <p className="mb-2 text-lg font-bold">
        {grade.emoji} Lv.{grade.level} {grade.name}
      </p>
      <label className="text-xs font-semibold text-muted">앱에 보이는 조건 설명</label>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-2 mt-1 w-full rounded-lg border border-line px-3 py-1.5 text-sm"
      />
      <label className="text-xs font-semibold text-muted">계산 규칙</label>
      <textarea
        value={rule}
        onChange={(e) => setRule(e.target.value)}
        rows={5}
        className="mt-1 w-full rounded-lg border border-line px-3 py-2 font-mono text-xs"
      />
      <Button variant="primary" className="mt-2" onClick={() => onSave(description, rule)}>
        저장
      </Button>
    </Card>
  );
}
