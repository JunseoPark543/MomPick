"use client";

import { createContext, useContext } from "react";

export type CurrentSeller = {
  id: string;
  name: string;
  status: string;
  role: "owner" | "staff";
};

// 지금 로그인한 담당자가 관리하는 업체 (SellerShell 이 채운다)
export const SellerContext = createContext<CurrentSeller | null>(null);

export function useSeller(): CurrentSeller {
  const seller = useContext(SellerContext);
  if (!seller) throw new Error("useSeller 는 SellerShell 안에서만 쓸 수 있어요.");
  return seller;
}
