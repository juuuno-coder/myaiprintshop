'use client';
import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="py-12" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:gift-bold" class="text-zinc-950 text-sm" />
            </div>
            <span className="font-bold text-lg text-white" style={{ fontFamily: "'Outfit',sans-serif" }}>GOODZZ</span>
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap gap-6 text-sm text-zinc-500">
            <Link href="/shop" className="hover:text-white transition-colors">상품</Link>
            <Link href="/create" className="hover:text-white transition-colors">굿즈 만들기</Link>
            <Link href="/terms" className="hover:text-white transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link>
            <Link href="/refund" className="hover:text-white transition-colors">환불정책</Link>
          </nav>

          <p className="text-zinc-600 text-xs">© 2025 GOODZZ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
