// 맘픽 공통 패키지
// database.types.ts 는 자동 생성 파일이라 직접 고치지 않는다.
// DB 가 바뀌면 맨 위 폴더에서 `npm run db:types` 로 다시 만든다.
import type { Database as GeneratedDatabase } from './database.types';

export type { Json, Tables, TablesInsert, TablesUpdate } from './database.types';

type Public = GeneratedDatabase['public'];
type GenTables = Public['Tables'];
type GenFunctions = Public['Functions'];

// K 칸을 넣지 않아도 되게 바꾼다
type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
// K 칸에 null 도 넣을 수 있게 바꾼다
type NullableKeys<T, K extends keyof T> = Omit<T, K> & { [P in K]: T[P] | null };

type WithOptionalInsert<Name extends keyof GenTables, K extends keyof GenTables[Name]['Insert']> = Omit<
  GenTables[Name],
  'Insert'
> & { Insert: OptionalKeys<GenTables[Name]['Insert'], K> };

type WithNullableArgs<Name extends keyof GenFunctions, K extends keyof GenFunctions[Name]['Args']> = Omit<
  GenFunctions[Name],
  'Args'
> & { Args: NullableKeys<GenFunctions[Name]['Args'], K> };

// 자동 생성 타입이 모르는 DB 규칙을 바로잡은 Database 타입. 앱에서는 이것을 쓴다.
export type Database = Omit<GeneratedDatabase, 'public'> & {
  public: Omit<Public, 'Tables' | 'Functions'> & {
    Tables: Omit<GenTables, 'posts' | 'used_items' | 'chat_rooms'> & {
      // 서버 트리거가 글쓴이·판매자 정보로 채우는 칸 (앱에서 보낼 수 없음)
      posts: WithOptionalInsert<'posts', 'neighborhood_code'>;
      used_items: WithOptionalInsert<'used_items', 'neighborhood_code'>;
      chat_rooms: WithOptionalInsert<'chat_rooms', 'seller_id'>;
    };
    Functions: Omit<GenFunctions, 'place_order' | 'request_sterilization'> & {
      // 쿠폰을 쓰지 않으면 null 을 보낸다
      place_order: WithNullableArgs<'place_order', 'p_coupon_id'>;
      request_sterilization: WithNullableArgs<'request_sterilization', 'p_coupon_id'>;
    };
  };
};
