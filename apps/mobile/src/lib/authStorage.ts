// 웹: 브라우저의 localStorage 를 쓴다.
// 배포 전에 페이지를 미리 만드는 단계(Node)에는 브라우저가 없으므로 저장하지 않는다.
export const authStorage = typeof window !== 'undefined' ? window.localStorage : undefined;
