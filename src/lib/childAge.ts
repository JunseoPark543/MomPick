// 아이 정보는 출생 연월만 저장한다 (DB에는 항상 그 달 1일로 저장)

export type YearMonth = {
  year: number;
  month: number; // 1~12
};

export function currentYearMonth(): YearMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

// 출생 연월부터 지금까지 몇 개월인지 (날짜는 모르므로 대략적인 월령)
export function monthsOld(birth: YearMonth, today: YearMonth = currentYearMonth()): number {
  return (today.year - birth.year) * 12 + (today.month - birth.month);
}

export function isFuture(target: YearMonth, today: YearMonth = currentYearMonth()): boolean {
  return monthsOld(target, today) < 0;
}

// DB 저장용 'YYYY-MM-01'
export function toBirthMonthDate({ year, month }: YearMonth): string {
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

// DB의 'YYYY-MM-DD' 를 연월로
export function fromBirthMonthDate(value: string): YearMonth {
  const [year, month] = value.split('-').map(Number);
  return { year, month };
}
