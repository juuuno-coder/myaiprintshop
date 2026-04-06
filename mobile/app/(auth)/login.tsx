import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ShoppingBag, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import * as SecureStore from "expo-secure-store";
import { apiFetch } from "@/lib/api";
import { initGoogleSignIn, signInWithGoogle } from "@/lib/google-auth";
import { signInWithKakao } from "@/lib/kakao-auth";
import { initNaverLogin, signInWithNaver } from "@/lib/naver-auth";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);

  const [naverLoading, setNaverLoading] = useState(false);

  useEffect(() => {
    initGoogleSignIn();
    initNaverLogin();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string }>("/auth/login", {
        method: "POST",
        body: { email: email.trim(), password },
      });
      await SecureStore.setItemAsync("userToken", data.token);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("로그인 실패", error.message || "다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.replace("/(tabs)");
    } catch (e: any) {
      if (e.code !== "SIGN_IN_CANCELLED") {
        Alert.alert("Google 로그인 실패", e.message || "다시 시도해주세요.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleNaverLogin = async () => {
    if (naverLoading) return;
    setNaverLoading(true);
    try {
      await signInWithNaver();
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("네이버 로그인 실패", e.message || "다시 시도해주세요.");
    } finally {
      setNaverLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    if (kakaoLoading) return;
    setKakaoLoading(true);
    try {
      await signInWithKakao();
      router.replace("/(tabs)");
    } catch (e: any) {
      if (e.code !== "SIGN_IN_CANCELLED") {
        Alert.alert("카카오 로그인 실패", e.message || "다시 시도해주세요.");
      }
    } finally {
      setKakaoLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerClassName="flex-grow pb-12"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600)}>
          <LinearGradient
            colors={["#f97316", "#ea580c"]}
            className="h-72 rounded-b-[48px] items-center justify-center px-6"
          >
            <View className="w-20 h-20 bg-white/20 rounded-3xl items-center justify-center mb-6 border border-white/30">
              <ShoppingBag size={32} color="#fff" />
            </View>
            <Text className="text-white text-4xl font-extrabold tracking-tight">GOODZZ</Text>
            <Text className="text-white/80 mt-2 text-base font-medium text-center">
              프리미엄 굿즈 쇼핑
            </Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(800)} className="px-6 -mt-12">
          <View className="bg-white rounded-[32px] p-8 shadow-2xl shadow-slate-200 border border-slate-50">
            <Text className="text-2xl font-bold text-slate-800 mb-6">로그인</Text>

            <View className="mb-5">
              <Text className="text-slate-500 text-xs font-bold mb-2 ml-1 uppercase tracking-wider">이메일</Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4">
                <Mail size={18} color="#94a3b8" />
                <TextInput
                  className="flex-1 ml-3 text-base text-slate-800 font-medium"
                  placeholder="name@example.com"
                  placeholderTextColor="#cbd5e1"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View className="mb-8">
              <View className="flex-row items-center justify-between mb-2 px-1">
                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">비밀번호</Text>
                <Pressable><Text className="text-orange-500 text-xs font-bold">비밀번호 찾기</Text></Pressable>
              </View>
              <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4">
                <Lock size={18} color="#94a3b8" />
                <TextInput
                  className="flex-1 ml-3 text-base text-slate-800 font-medium"
                  placeholder="비밀번호를 입력해주세요"
                  placeholderTextColor="#cbd5e1"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#94a3b8" />
                  ) : (
                    <Eye size={20} color="#94a3b8" />
                  )}
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              className="bg-orange-500 rounded-2xl py-4 flex-row items-center justify-center shadow-lg shadow-orange-500/30"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text className="text-white text-base font-bold mr-2">로그인</Text>
                  <ArrowRight size={18} color="#fff" strokeWidth={3} />
                </>
              )}
            </Pressable>
          </View>

          <View className="mt-8 flex-row justify-center items-center">
            <View className="h-[1px] flex-1 bg-slate-100" />
            <Text className="text-slate-400 text-sm mx-4">또는 소셜 로그인</Text>
            <View className="h-[1px] flex-1 bg-slate-100" />
          </View>

          <View className="mt-4 gap-3">
            <Pressable
              onPress={handleNaverLogin}
              disabled={naverLoading}
              className="bg-[#03C75A] rounded-2xl py-4 flex-row items-center justify-center"
              style={{ opacity: naverLoading ? 0.6 : 1 }}
            >
              {naverLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white text-base font-bold">네이버로 로그인</Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleKakaoLogin}
              disabled={kakaoLoading}
              className="bg-[#FEE500] rounded-2xl py-4 flex-row items-center justify-center"
              style={{ opacity: kakaoLoading ? 0.6 : 1 }}
            >
              {kakaoLoading ? (
                <ActivityIndicator color="#3C1E1E" size="small" />
              ) : (
                <Text className="text-[#3C1E1E] text-base font-bold">카카오로 로그인</Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleGoogleLogin}
              disabled={googleLoading}
              className="border border-slate-200 rounded-2xl py-4 flex-row items-center justify-center"
              style={{ opacity: googleLoading ? 0.6 : 1 }}
            >
              {googleLoading ? (
                <ActivityIndicator color="#94a3b8" size="small" />
              ) : (
                <Text className="text-slate-600 text-base font-bold">Google로 로그인</Text>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
