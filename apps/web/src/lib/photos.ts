import fs from "node:fs";
import path from "node:path";

export type Visual =
  | { kind: "photo"; src: string; alt: string }
  | { kind: "screen"; src: string; width: number; height: number; alt: string };

// 사진 자리: public/photos/<이름>.jpg 가 있으면 그 사진을, 없으면 앱 화면을 보여준다.
// 사진을 넣는 방법은 public/photos/README.md
export function visual(name: string, alt: string, fallback: { src: string; width: number; height: number }): Visual {
  const file = path.join(process.cwd(), "public", "photos", `${name}.jpg`);
  if (fs.existsSync(file)) return { kind: "photo", src: `/photos/${name}.jpg`, alt };
  return { kind: "screen", ...fallback, alt };
}
