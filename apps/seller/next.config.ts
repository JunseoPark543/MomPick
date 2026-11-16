import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // 개발 화면에만 뜨는 Next.js 원형 표시를 숨긴다.
  devIndicators: false,
  // 모노레포 공통 패키지(TypeScript 원본)를 함께 빌드한다
  transpilePackages: ["@mompick/shared"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
