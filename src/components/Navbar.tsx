"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Menu } from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const glassStyle = {
  background: 'rgba(9,9,11,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
};

const mobileMenuStyle = {
  background: 'rgba(9,9,11,0.97)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
};

function AuthButton() {
  const { user, loginWithGoogle } = useAuth();

  if (!user) {
    return (
      <button
        onClick={loginWithGoogle}
        className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
      >
        로그인
      </button>
    );
  }

  return (
    <Link href="/mypage" className="flex items-center gap-2">
      {user.photoURL ? (
        <Image
          src={user.photoURL}
          alt={user.displayName || "User"}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full border border-zinc-700"
          unoptimized
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          {/* @ts-ignore */}
          <iconify-icon icon="solar:user-bold" class="text-zinc-400 text-base" />
        </div>
      )}
    </Link>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const cart = useStore((state) => state.cart);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { name: '상품 보기', href: '/shop' },
    { name: '굿즈 만들기', href: '/create' },
    { name: '마이페이지', href: '/mypage' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40" style={glassStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:gift-bold" class="text-zinc-950 text-lg" />
              </div>
              <span
                className="font-bold text-xl tracking-tight text-white"
                style={{ fontFamily: "'Outfit', 'Pretendard', sans-serif" }}
              >
                GOODZZ
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                {/* @ts-ignore */}
                <iconify-icon icon="solar:magnifer-linear" class="text-lg" />
              </button>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:cart-large-4-linear" class="text-lg" />
                {mounted && cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-amber-500 text-zinc-950 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Divider */}
              <div className="w-px h-5 bg-zinc-800" />

              <AuthButton />

              {/* CTA */}
              <Link
                href="/create"
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm px-4 py-2.5 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
              >
                {/* @ts-ignore */}
                <iconify-icon icon="solar:magic-stick-3-bold" />
                지금 만들기
              </Link>
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden flex items-center gap-3">
              <Link href="/cart" className="relative p-2 text-zinc-400">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:cart-large-4-linear" class="text-xl" />
                {mounted && cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-amber-500 text-zinc-950 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-zinc-400 hover:text-white"
              >
                {isMenuOpen
                  ? <X className="w-5 h-5" />
                  : <Menu className="w-5 h-5" />
                }
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div style={mobileMenuStyle}>
            <div className="px-4 py-6 space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center py-3 px-3 text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <Link
                  href="/create"
                  className="flex items-center justify-center gap-2 bg-amber-500 text-zinc-950 font-bold px-6 py-4 rounded-xl w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:magic-stick-3-bold" />
                  지금 만들기
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Search overlay */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50"
          style={{ background: 'rgba(9,9,11,0.97)', backdropFilter: 'blur(20px)' }}
        >
          <div className="max-w-3xl mx-auto px-6 pt-24">
            <div className="flex justify-between items-center mb-8">
              <p className="text-xs text-zinc-600 uppercase tracking-widest">검색</p>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSearch}>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="무엇을 찾으시나요?"
                className="w-full text-4xl font-bold border-none bg-transparent text-white placeholder:text-zinc-700 focus:outline-none py-4"
                style={{ fontFamily: "'Outfit','Pretendard',sans-serif" }}
              />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
