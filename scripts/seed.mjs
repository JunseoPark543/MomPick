// 데모용 예시 데이터 넣기: node scripts/seed.mjs
// 앱과 같은 공개 키로, 가짜 회원이 직접 가입·글쓰기를 하는 방식이라 보안 규칙(RLS)을 그대로 따른다.
// 여러 번 실행해도 이미 만든 회원·글·매물은 다시 만들지 않는다.
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BEST_POSTS, SEED_CHATS, SEED_COMMENTS, SEED_POSTS, SEED_USED_ITEMS, SEED_USERS } from './seed-data.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');

// .env.local 에서 주소와 공개 키를 읽는다
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, '.env.local'), 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^[A-Z_]+=/.test(line))
    .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1).replace(/^"|"$/g, '')]),
);
const URL = env.EXPO_PUBLIC_SUPABASE_URL;
const KEY = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// 가짜 회원 비밀번호는 처음 한 번 만들어 이 컴퓨터에만 저장한다 (Git 제외)
const accountsFile = path.join(here, 'seed-accounts.local.json');
if (!fs.existsSync(accountsFile)) {
  fs.writeFileSync(accountsFile, JSON.stringify({ password: crypto.randomBytes(12).toString('base64url') }, null, 2));
}
const { password } = JSON.parse(fs.readFileSync(accountsFile, 'utf8'));
const emailOf = (i) => `seed${String(i + 1).padStart(2, '0')}@mompick-demo.dev`;

const newClient = () => createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } });

function must(result, what) {
  if (result.error) throw new Error(`${what}: ${result.error.message}`);
  return result.data;
}

function birthMonth(monthsAgo) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

async function signIn(i) {
  const client = newClient();
  const email = emailOf(i);
  let result = await client.auth.signInWithPassword({ email, password });
  if (result.error) {
    result = await client.auth.signUp({
      email,
      password,
      options: { data: { adult_confirmed: true, terms_agreed: true } },
    });
    if (result.error) throw new Error(`${email} 가입 실패: ${result.error.message}`);
    if (!result.data.session) throw new Error('이메일 인증이 켜져 있어요. 대시보드에서 Confirm email 을 꺼 주세요.');
  }
  return { client, id: result.data.user.id };
}

async function main() {
  const anon = newClient();
  const tableCheck = await anon.from('products').select('id').limit(1);
  if (tableCheck.error) {
    console.log('⚠️  products 표가 없어요. 20261113000009_market.sql 을 먼저 실행해 주세요. (회원·글·매물은 계속 넣을게요)');
  }

  // 1) 동네 코드: 구마다 동 목록에서 돌아가며 고른다
  const districts = [...new Set(SEED_USERS.map((u) => u.sigungu))];
  const hoods = must(
    await anon.from('neighborhoods').select('code, sigungu, dong').in('sigungu', districts).order('code'),
    '동네 목록',
  );
  const pickCount = {};
  const pickHood = (sigungu) => {
    const list = hoods.filter((h) => h.sigungu === sigungu);
    pickCount[sigungu] = (pickCount[sigungu] ?? 0) + 1;
    return list[(pickCount[sigungu] * 3) % list.length];
  };

  // 2) 회원 가입 + 프로필 + 아이
  const users = [];
  for (const [i, u] of SEED_USERS.entries()) {
    const { client, id } = await signIn(i);
    const hood = pickHood(u.sigungu);
    must(
      await client.from('profiles').update({ nickname: u.nickname, neighborhood_code: hood.code }).eq('id', id),
      `${u.nickname} 프로필`,
    );
    const child = await client.from('children').select('id').limit(1).maybeSingle();
    if (!child.data) {
      must(await client.from('children').insert({ birth_month: birthMonth(u.monthsAgo) }), `${u.nickname} 아이`);
    }
    users.push({ ...u, client, id, dong: hood.dong });
    console.log(`회원 ${i + 1}/${SEED_USERS.length}: ${u.nickname} (${u.sigungu} ${hood.dong})`);
  }

  // 이미 넣은 적이 있으면 글·댓글·좋아요는 건너뛴다
  const already = await users[0].client.from('posts').select('id').eq('author_id', users[0].id).limit(1);
  if (already.data?.length) {
    console.log('이미 예시 글이 있어서 글·댓글·좋아요는 건너뛸게요.');
  } else {
    // 3) 글
    const postIds = [];
    for (const p of SEED_POSTS) {
      const author = users[p.author];
      const row = must(
        await author.client
          .from('posts')
          .insert({ board: p.board, category: p.category, title: p.title, body: p.body })
          .select('id')
          .single(),
        `글 "${p.title}"`,
      );
      postIds.push(row.id);
    }
    console.log(`글 ${postIds.length}개`);

    // 4) 댓글 (팩트 체크 포함)
    for (const c of SEED_COMMENTS) {
      must(
        await users[c.author].client.from('comments').insert({
          post_id: postIds[c.post],
          body: c.body,
          is_fact_check: !!c.source,
          source: c.source ?? null,
        }),
        '댓글',
      );
    }
    console.log(`댓글 ${SEED_COMMENTS.length}개`);

    // 5) 좋아요: 베스트 후보 글은 기준 수만큼, 나머지는 몇 개씩
    const settings = await users[0].client.from('app_settings').select('value').eq('key', 'best_post_min_likes').maybeSingle();
    const bestMin = Number(settings.data?.value ?? 10);
    let likeCount = 0;
    for (const [index, p] of SEED_POSTS.entries()) {
      const want = BEST_POSTS.includes(index) ? bestMin : (index * 7) % 5;
      const likers = users.filter((_, ui) => ui !== p.author).slice(0, want);
      for (const liker of likers) {
        const r = await liker.client.from('post_likes').insert({ post_id: postIds[index] });
        if (!r.error) likeCount++;
      }
    }
    console.log(`좋아요 ${likeCount}개 (베스트 기준 ${bestMin}개${bestMin > users.length - 1 ? ' — 회원 수가 모자라 베스트는 안 될 수 있어요' : ''})`);
  }

  // 이미 넣은 적이 있으면 매물·채팅은 건너뛴다
  const alreadyItems = await anon.from('used_items').select('id').eq('seller_id', users[0].id).limit(1);
  if (alreadyItems.data?.length) {
    console.log('이미 예시 매물이 있어서 매물·채팅은 건너뛸게요.');
  } else {
    // 6) 중고 매물 (사진 업로드 포함)
    const itemIds = [];
    for (const item of SEED_USED_ITEMS) {
      const seller = users[item.seller];
      const imagePath = `${seller.id}/seed-${item.image}.jpg`;
      const file = fs.readFileSync(path.join(here, 'seed-images', `${item.image}.jpg`));
      // 덮어쓰기는 허용되지 않으므로, 이미 올라가 있으면 그대로 쓴다
      const uploaded = await seller.client.storage.from('used-images').upload(imagePath, file, { contentType: 'image/jpeg' });
      if (uploaded.error && !/exists|Duplicate/i.test(uploaded.error.message)) {
        throw new Error(`사진 ${item.image}: ${uploaded.error.message}`);
      }
      const row = must(
        await seller.client
          .from('used_items')
          .insert({
            title: item.title,
            category: item.category,
            price: item.price,
            condition: item.condition,
            size: item.size,
            usage_period: item.usage,
            description: item.description,
            safe_pay_available: true,
            image_paths: [imagePath],
          })
          .select('id')
          .single(),
        `매물 "${item.title}"`,
      );
      if (item.status === 'reserved') {
        must(await seller.client.from('used_items').update({ status: 'reserved' }).eq('id', row.id), '예약중 변경');
      }
      itemIds.push(row.id);
    }
    console.log(`중고 매물 ${itemIds.length}개`);

    // 7) 채팅 + 거래 완료
    for (const chat of SEED_CHATS) {
      const item = SEED_USED_ITEMS[chat.item];
      const buyer = users[chat.buyer];
      const seller = users[item.seller];
      const room = must(
        await buyer.client.from('chat_rooms').insert({ item_id: itemIds[chat.item] }).select('id').single(),
        '채팅방',
      );
      for (const [m, body] of chat.messages.entries()) {
        const sender = m % 2 === 0 ? buyer : seller;
        must(await sender.client.from('chat_messages').insert({ room_id: room.id, body }), '메시지');
      }
      if (chat.complete) {
        must(await seller.client.rpc('complete_used_trade', { p_room_id: room.id, p_method: 'direct' }), '거래 완료');
      }
    }
    console.log(`채팅 ${SEED_CHATS.length}개`);
  }

  // 8) 등급 계산 (환영 쿠폰·배지 지급)
  for (const u of users) {
    await u.client.rpc('refresh_my_level');
  }
  console.log('등급 계산 완료');
  console.log(`\n✅ 끝! 예시 회원 로그인: ${emailOf(0)} ~ ${emailOf(users.length - 1)} / 비밀번호는 scripts/seed-accounts.local.json`);
}

main().catch((error) => {
  console.error('❌ 실패:', error.message);
  process.exit(1);
});
