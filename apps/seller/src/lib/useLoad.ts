"use client";

import { useCallback, useEffect, useState } from "react";

type Result<T> = { key: string; data: T | null; error: string };

// 화면이 뜰 때, 그리고 deps 가 바뀔 때 데이터를 불러온다. reload() 로 다시 불러온다.
// 다시 불러오는 동안에는 이전 데이터를 그대로 보여준다.
export function useLoad<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const key = `${JSON.stringify(deps)}:${version}`;

  useEffect(() => {
    let cancelled = false;
    load().then(
      (data) => {
        if (!cancelled) setResult({ key, data, error: "" });
      },
      (e: unknown) => {
        if (!cancelled) {
          setResult((prev) => ({ key, data: prev?.data ?? null, error: e instanceof Error ? e.message : "불러오지 못했어요." }));
        }
      },
    );
    return () => {
      cancelled = true;
    };
    // load 는 매번 새로 만들어지는 함수라, 무엇을 불러올지는 key(deps·version)로만 정한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return {
    data: result?.data ?? null,
    error: result?.error ?? "",
    loading: result?.key !== key,
    reload,
  };
}

// Supabase 결과에서 오류면 던지고, 아니면 데이터를 돌려준다
export function unwrap<T>(result: { data: T; error: { message: string } | null }): NonNullable<T> {
  if (result.error) throw new Error(result.error.message);
  if (result.data === null || result.data === undefined) throw new Error("데이터가 없어요.");
  return result.data;
}
