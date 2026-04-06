import NaverLogin from "@react-native-seoul/naver-login";
import * as SecureStore from "expo-secure-store";
import { apiFetch } from "./api";

export function initNaverLogin() {
  NaverLogin.initialize({
    appName: "굿쯔",
    consumerKey: process.env.EXPO_PUBLIC_NAVER_CLIENT_ID || "",
    consumerSecret: process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET || "",
    serviceUrlScheme: "goodzz",
  });
}

export async function signInWithNaver(): Promise<void> {
  const { successResponse, failureResponse } = await NaverLogin.login();
  if (!successResponse) {
    throw new Error(failureResponse?.message || "네이버 로그인 실패");
  }
  const data = await apiFetch<{ token: string; user: any }>("/auth/social", {
    method: "POST",
    body: { provider: "naver", access_token: successResponse.accessToken },
  });
  await SecureStore.setItemAsync("userToken", data.token);
}
