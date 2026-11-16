import Image from "next/image";
import type { ReactNode } from "react";

import type { Visual } from "@/lib/photos";

type Props = {
  title: string;
  href?: string;
  description: string;
  visual: Visual;
  children?: ReactNode;
};

// 서비스 한 줄: 왼쪽 이름·설명, 오른쪽 큰 사진 (사진이 없으면 앱 화면)
export default function ServiceRow({ title, href, description, visual, children }: Props) {
  const heading = (
    <>
      {title}
      {href ? <span className="ml-1 text-[0.8em]">↗</span> : null}
    </>
  );

  return (
    <section className="border-t border-line py-16 md:py-24">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
        <div>
          <h3 className="text-[28px] font-bold leading-snug md:text-[34px]">
            {href ? (
              <a href={href} className="hover:underline">
                {heading}
              </a>
            ) : (
              heading
            )}
          </h3>
          <p className="mt-5 max-w-[420px] text-[17px] leading-[1.75] text-sub">{description}</p>
          {children}
        </div>
        <VisualBox visual={visual} />
      </div>
    </section>
  );
}

function VisualBox({ visual }: { visual: Visual }) {
  if (visual.kind === "photo") {
    return (
      <div className="relative aspect-[27/16] overflow-hidden rounded-[24px] bg-soft">
        <Image src={visual.src} alt={visual.alt} fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" />
      </div>
    );
  }
  // 사진이 오기 전: 앱 화면 위쪽만 담백하게
  return (
    <div className="relative aspect-[27/16] overflow-hidden rounded-[24px] bg-soft">
      <Image
        src={visual.src}
        width={visual.width}
        height={visual.height}
        alt={visual.alt}
        className="absolute left-1/2 top-10 w-[54%] -translate-x-1/2 rounded-t-[18px] shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
      />
    </div>
  );
}
