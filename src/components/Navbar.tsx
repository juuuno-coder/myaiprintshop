"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, User, Menu, Heart, X, LogIn, Wand2 } from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAllCategories } from "@/lib/categories";

function AuthButton() {
  const { user, loginWithGoogle } = useAuth();

  if (!user) {
    return (
      <button
        onClick={loginWithGoogle}
        className="btn btn-secondary btn-sm"
      >
        <LogIn className="w-4 h-4" />
        로그인
      </button>
    );
  }

  return (
    <Link href="/mypage" className="text-gray-600 hover:text-gray-900 transition-colors">
      {user.photoURL ? (
        <Image
          src={user.photoURL}
          alt={user.displayName || "User"}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full border border-gray-200"
          unoptimized
        />
      ) : (
        <User className="w-5 h-5" />
      )}
    </Link>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
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

  return (
    <>
      {/* Stripe-style Navbar */}
      {/* Premium Glassy Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-display font-black tracking-tighter text-gray-900 group-hover:text-primary-600 transition-colors">
                GOODZZ<span className="text-primary-600">.</span>
              </span>
            </Link>

            {/* Desktop Menu - Premium Typography */}
            <div className="hidden md:flex items-center gap-2">
              {[
                { name: '홈', href: '/' },
                { name: '모든 상품', href: '/shop' },
                { name: '사진으로 만들기', href: '/create', primary: true },
                { name: '마이페이지', href: '/mypage' },
              ].map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`px-5 py-2 text-sm font-bold tracking-tight rounded-full transition-all ${
                    item.primary 
                      ? 'text-primary-600 hover:bg-primary-50' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/create"
                className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-gray-200 active:scale-95"
              >
                무료로 시작하기
              </Link>
              <div className="flex items-center">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all"
                  title="검색"
                >
                  <Search className="w-5 h-5" />
                </button>
                <Link
                  href="/cart"
                  className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all relative"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {mounted && cartCount > 0 && (
                    <span className="absolute top-1 right-1 bg-primary-600 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <div className="ml-2 pl-4 border-l border-gray-100">
                   <AuthButton />
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-2">
              <Link
                href="/"
                className="block py-2 text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                홈
              </Link>
              <Link
                href="/shop"
                className="block py-2 text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                상품
              </Link>
              <Link
                href="/create"
                className="block py-2 text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                AI 디자인
              </Link>
              <Link
                href="/mypage"
                className="block py-2 text-gray-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                마이페이지
              </Link>
              <div className="pt-4 flex items-center gap-4 border-t border-gray-200">
                <button onClick={() => { setIsSearchOpen(true); setIsMenuOpen(false); }}>
                  <Search className="w-6 h-6 text-gray-600" />
                </button>
                <Link href="/cart" className="relative">
                  <ShoppingCart className="w-6 h-6 text-gray-600" />
                  {mounted && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link href="/mypage">
                  <User className="w-6 h-6 text-gray-600" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Search Overlay - 미니멀하게 */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="max-w-3xl mx-auto px-6 pt-24">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">검색</h2>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-900" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="relative mb-12">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="무엇을 찾으시나요?"
                className="w-full text-4xl font-bold border-none bg-transparent placeholder:text-gray-200 focus:ring-0 text-gray-900 py-4 focus-ring"
              />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
