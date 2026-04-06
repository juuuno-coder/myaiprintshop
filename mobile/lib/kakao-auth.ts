import { login as kakaoLogin } from "@react-native-kakao/user";
import * as SecureStore from "expo-secure-store";
import { apiFetch } from "./api";

export async function signInWithKakao(): Promise<void> {
  const kakaoToken = await kakaoLogin();
  const accessToken = kakaoToken.accessToken;

  const data = await apiFetch<{ token: string; user: any }>("/auth/social", {
    method: "POST",
    body: { provider: "kakao", access_token: accessToken },
  });

  await SecureStore.setItemAsync("userToken", data.token);
}
