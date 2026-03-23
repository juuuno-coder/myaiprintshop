'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-3xl">
          {/* 메인 타이틀 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-[1.15] tracking-tight">
            AI로 디자인하고{' '}
            <br className="hidden sm:block" />
            바로 제작하는{' '}
            <span className="text-gradient-purple">프린트샵</span>
          </h1>

          {/* 서브타이틀 */}
          <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed max-w-xl">
            상상을 현실로 만드는 가장 쉬운 방법.
            <br />
            명함, 스티커, 티셔츠, 에코백까지 AI로 디자인하세요.
          </p>

          {/* CTA 버튼 */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/create"
              className="btn btn-primary btn-lg group"
            >
              지금 시작하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/shop"
              className="btn btn-secondary btn-lg"
            >
              둘러보기
            </Link>
          </div>

          {/* 신뢰 배지 */}
          <div className="mt-10 flex flex-wrap items-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span>24시간 빠른 제작</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span>무료 배송</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span>100% 환불 보장</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
