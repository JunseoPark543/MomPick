import type { ButtonHTMLAttributes, ReactNode } from "react";

// 관리자 화면에서 공통으로 쓰는 작은 부품들

export function PageTitle({ title, description, right }: { title: string; description?: string; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-white p-5 ${className}`}>{children}</div>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
};

export function Button({ variant = "secondary", size = "sm", className = "", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-brand text-white hover:opacity-90",
    secondary: "border border-line bg-white hover:bg-background",
    danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    ghost: "text-muted hover:text-foreground",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2.5 text-base" };
  return (
    <button
      className={`rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}

const TONES = {
  gray: "bg-gray-100 text-gray-700",
  brand: "bg-brand-soft text-brand",
  green: "bg-green-50 text-green-700",
  yellow: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  blue: "bg-blue-50 text-blue-700",
} as const;

export type Tone = keyof typeof TONES;

export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${TONES[tone]}`}>{children}</span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-10 text-center text-sm text-muted">{children}</p>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  return children ? <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{children}</p> : null;
}

export function Loading() {
  return <p className="py-10 text-center text-sm text-muted">불러오는 중…</p>;
}

// 표 (가로가 좁으면 옆으로 밀어서 보기)
export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-line bg-background/60 text-xs text-muted">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
