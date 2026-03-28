'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(9,9,11,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:gift-bold" class="text-zinc-950 text-lg" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white" style={{ fontFamily: "'Outfit', 'Pretendard', sans-serif" }}>
              GOODZZ
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">기능</a>
            <a href="#how" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">이용 방법</a>
            <a href="#reviews" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">후기</a>
            <Link href="/shop" className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">상품 보기</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/auth" className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors duration-200">
              로그인
            </Link>
            <Link
              href="/create"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm px-4 py-2.5 rounded-lg transition-all duration-300"
            >
              {/* @ts-ignore */}
              <iconify-icon icon="solar:add-square-bold" />
              지금 만들기
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
