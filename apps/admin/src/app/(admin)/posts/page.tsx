"use client";

import { BOARD_LABELS, FACT_CHECK_LABELS, POST_CATEGORY_LABELS, label } from "@mompick/shared";
import { useState } from "react";

import { Badge, Button, Empty, ErrorText, Loading, PageTitle, Table, Td } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { unwrap, useLoad } from "@/lib/useLoad";

type Post = {
  id: string;
  board: string;
  category: string;
  title: string;
  body: string;
  like_count: number;
  comment_count: number;
  best_at: string | null;
  fact_check_status: string | null;
  is_hidden: boolean;
  created_at: string;
  author: { nickname: string | null } | null;
  neighborhood: { sigungu: string; dong: string } | null;
};

const COLUMNS =
  "id, board, category, title, body, like_count, comment_count, best_at, fact_check_status, is_hidden, created_at, author:profiles!posts_author_id_fkey(nickname), neighborhood:neighborhoods(sigungu, dong)";

type Filter = "all" | "hidden" | "best" | "fact";

// 게시글 관리: 팩트 체크 표시, 베스트 지정·취소, 숨김·해제
export default function PostsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const { data, error, loading, reload } = useLoad<Post[]>(async () => {
    let q = supabase().from("posts").select(COLUMNS).order("created_at", { ascending: false }).limit(200);
    if (filter === "hidden") q = q.eq("is_hidden", true);
    if (filter === "best") q = q.not("best_at", "is", null);
    if (filter === "fact") q = q.not("fact_check_status", "is", null);
    if (keyword) q = q.ilike("title", `%${keyword}%`);
    return unwrap(await q.returns<Post[]>());
  }, [filter, keyword]);

  async function update(id: string, values: { is_hidden?: boolean; best_at?: string | null; fact_check_status?: string | null }) {
    setActionError("");
    const res = await supabase().from("posts").update(values).eq("id", id);
    if (res.error) return setActionError(res.error.message);
    reload();
  }

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "hidden", label: "숨김" },
    { value: "best", label: "베스트" },
    { value: "fact", label: "팩트 체크 표시됨" },
  ];

  return (
    <>
      <PageTitle title="게시글" description="최근 200개. 팩트 체크 표시와 베스트는 앱에 바로 반영돼요." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <Button key={f.value} variant={filter === f.value ? "primary" : "secondary"} onClick={() => setFilter(f.value)}>
            {f.label}
          </Button>
        ))}
        <form
          className="ml-auto flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setKeyword(search.trim());
          }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목 검색"
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm"
          />
          <Button>검색</Button>
        </form>
      </div>
      <ErrorText>{error || actionError}</ErrorText>
      {loading && !data ? <Loading /> : null}
      {data && data.length === 0 ? <Empty>글이 없어요.</Empty> : null}
      {data && data.length > 0 ? (
        <Table head={["작성", "글", "글쓴이·동네", "반응", "표시", "관리"]}>
          {data.map((p) => (
            <tr key={p.id} className={p.is_hidden ? "bg-red-50/40" : ""}>
              <Td className="whitespace-nowrap text-muted">{formatDateTime(p.created_at)}</Td>
              <Td>
                <div className="flex gap-1">
                  <Badge>{label(BOARD_LABELS, p.board)}</Badge>
                  <Badge>{label(POST_CATEGORY_LABELS, p.category)}</Badge>
                </div>
                <button className="mt-1 text-left font-semibold hover:underline" onClick={() => setOpen(open === p.id ? null : p.id)}>
                  {p.title}
                </button>
                {open === p.id ? <p className="mt-2 max-w-lg whitespace-pre-wrap text-muted">{p.body}</p> : null}
              </Td>
              <Td>
                {p.author?.nickname ?? "-"}
                <p className="text-xs text-muted">
                  {p.neighborhood?.sigungu} {p.neighborhood?.dong}
                </p>
              </Td>
              <Td className="whitespace-nowrap text-muted">
                ♡ {p.like_count} · 💬 {p.comment_count}
              </Td>
              <Td>
                <div className="flex flex-col items-start gap-1">
                  {p.best_at ? <Badge tone="brand">베스트</Badge> : null}
                  {p.fact_check_status ? (
                    <Badge tone={p.fact_check_status === "checked" ? "green" : "yellow"}>
                      {label(FACT_CHECK_LABELS, p.fact_check_status)}
                    </Badge>
                  ) : null}
                  {p.is_hidden ? <Badge tone="red">숨김</Badge> : null}
                </div>
              </Td>
              <Td>
                <div className="flex flex-col gap-1">
                  <select
                    value={p.fact_check_status ?? ""}
                    onChange={(e) => update(p.id, { fact_check_status: e.target.value || null })}
                    className="rounded-lg border border-line bg-white px-2 py-1 text-sm">
                    <option value="">팩트 체크 표시 없음</option>
                    <option value="checked">팩트 체크됨</option>
                    <option value="caution">확인 필요</option>
                  </select>
                  <div className="flex gap-1">
                    <Button onClick={() => update(p.id, { best_at: p.best_at ? null : new Date().toISOString() })}>
                      {p.best_at ? "베스트 취소" : "베스트 지정"}
                    </Button>
                    <Button variant={p.is_hidden ? "secondary" : "danger"} onClick={() => update(p.id, { is_hidden: !p.is_hidden })}>
                      {p.is_hidden ? "숨김 해제" : "숨기기"}
                    </Button>
                  </div>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      ) : null}
    </>
  );
}
