"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("로그인 성공!", { description: "환영합니다." });
    } catch (error: any) {
      console.error("Login Failed:", error);
      toast.error("로그인에 실패했습니다.", { description: error.message });
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success("로그아웃 되었습니다.");
    } catch (error) {
      console.error("Logout Failed:", error);
      toast.error("로그아웃 실패");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

const DEFAULT_AUTH: AuthContextType = {
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context ?? DEFAULT_AUTH;
}
