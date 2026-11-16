// 폰(iOS·Android): expo-sqlite 가 제공하는 localStorage 에 로그인 정보를 저장한다
import 'expo-sqlite/localStorage/install';

export const authStorage = localStorage;
