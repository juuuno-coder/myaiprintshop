'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function LandingCTA() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.cssText += 'opacity:1;transform:translateY(0)';
        }
      },
      { threshold: 0.2 }
    );
    el.style.cssText = 'opacity:0;transform:translateY(2rem);transition:opacity 0.8s cubic-bezier(0.16,1,0.3,1),transform 0.8s cubic-bezier(0.16,1,0.3,1)';
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-32" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section
          ref={ref}
          className="relative overflow-hidden rounded-3xl p-12 sm:p-20 text-center"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.18) 0%, transparent 60%),
              rgba(255,255,255,0.02)
            `,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-6">지금 시작하세요</p>
          <h2
            className="font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6"
            style={{ fontFamily: "'Outfit','Pretendard',sans-serif", wordBreak: 'keep-all' }}
          >
            첫 굿즈가<br />기다리고 있습니다.
          </h2>
          <p
            className="text-zinc-400 text-lg leading-relaxed mb-10 mx-auto"
            style={{ maxWidth: '45ch', wordBreak: 'keep-all' }}
          >
            회원가입은 30초면 됩니다. 사진 한 장으로 지금 바로 나만의 굿즈를 만들어보세요.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xl px-10 py-5 rounded-2xl transition-all duration-400 hover:scale-[1.02] active:scale-[0.97]"
            style={{ minHeight: 64, fontFamily: "'Outfit',sans-serif" }}
          >
            {/* @ts-ignore */}
            <iconify-icon icon="solar:magic-stick-3-bold" class="text-2xl" />
            무료로 시작하기
          </Link>
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {['신용카드 불필요', '첫 주문 무료 배송', '30일 품질 보증'].map((trust) => (
              <div key={trust} className="flex items-center gap-2 text-zinc-500 text-sm">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:check-circle-bold" class="text-amber-500 text-base" />
                {trust}
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
