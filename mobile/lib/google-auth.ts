import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as SecureStore from "expo-secure-store";
import { apiFetch } from "./api";

export function initGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "",
    offlineAccess: true,
  });
}

export async function signInWithGoogle(): Promise<void> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const userInfo = await GoogleSignin.signIn();
  const tokens = await GoogleSignin.getTokens();
  const accessToken = tokens.accessToken;

  const data = await apiFetch<{ token: string; user: any }>("/auth/social", {
    method: "POST",
    body: { provider: "google", access_token: accessToken },
  });

  await SecureStore.setItemAsync("userToken", data.token);
}
