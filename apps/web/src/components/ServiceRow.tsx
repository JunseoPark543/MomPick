import Image from "next/image";
import type { ReactNode } from "react";

import Icon, { type IconName } from "@/components/Icon";

type Props = {
  icon: IconName;
  title: string;
  description: string;
  screen: { src: string; width: number; height: number; alt: string };
  // 화면 사진 배경색 (서비스마다 다르게)
  tint: string;
  children?: ReactNode;
};

// 서비스 한 줄: 왼쪽 아이콘·이름·설명, 오른쪽 둥근 패널 안의 실제 앱 화면
export default function ServiceRow({ icon, title, description, screen, tint, children }: Props) {
  return (
    <section className="border-b border-line/70 py-14 last:border-b-0 md:py-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-white text-brand shadow-sm">
            <Icon name={icon} />
          </div>
          <h3 className="mt-8 text-2xl font-extrabold md:text-3xl">{title}</h3>
          <p className="mt-4 max-w-md text-base leading-7 text-foreground/75 md:text-lg md:leading-8">{description}</p>
          {children}
        </div>
        <div className="relative h-72 overflow-hidden rounded-[28px] md:h-80" style={{ background: tint }}>
          <div className="absolute left-1/2 top-8 w-[62%] max-w-[300px] -translate-x-1/2 overflow-hidden rounded-t-[26px] border-[6px] border-b-0 border-foreground/90 bg-white shadow-2xl">
            <Image src={screen.src} width={screen.width} height={screen.height} alt={screen.alt} className="h-auto w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
