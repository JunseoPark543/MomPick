// 서비스 아이콘 (선 그림). 색은 부모의 글자색을 따른다.
const PATHS = {
  people: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <circle cx="16.5" cy="9" r="2.6" />
      <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
      <path d="M14.5 14.3c.6-.2 1.3-.3 2-.3 2.2 0 3.9 1.5 4.4 4.3" />
    </>
  ),
  swap: (
    <>
      <path d="M4 8h14l-3.5-3.5" />
      <path d="M20 16H6l3.5 3.5" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5.5c0 4.2 3 7.8 7 9.5 4-1.7 7-5.3 7-9.5V6l-7-3Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
  baby: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M9.5 14.5a3.5 3.5 0 0 0 5 0" />
      <circle cx="9.5" cy="11" r=".6" fill="currentColor" />
      <circle cx="14.5" cy="11" r=".6" fill="currentColor" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  tag: (
    <>
      <path d="M3.5 12.5 11 5h7v7l-7.5 7.5a1.5 1.5 0 0 1-2.1 0l-4.9-4.9a1.5 1.5 0 0 1 0-2.1Z" />
      <circle cx="15" cy="8" r="1.2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, className = "h-8 w-8" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {PATHS[name]}
    </svg>
  );
}
