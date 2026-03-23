'use client';

import { Sparkles, ChevronRight, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  category: string;
  badge?: string;
  reviewCount: number;
  rating: number;
}

interface Props {
  aiGoodsItems: Product[];
  bestProducts: Product[];
}

export default function HomeClientContent({ aiGoodsItems, bestProducts }: Props) {
  return (
    <>
      {/* AI 이미지로 만들기 좋은 굿즈 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-500" />
                AI 이미지로 만들기 좋은 굿즈
              </h2>
              <p className="text-gray-500 mt-2">AI 디자이너가 추천하는 커스텀 굿즈</p>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-1 text-purple-600 font-semibold hover:gap-2 transition-all">
              전체보기 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {aiGoodsItems.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/shop" className="inline-flex items-center gap-1 text-purple-600 font-semibold">
              전체보기 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 베스트 상품 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-purple-500" />
                베스트 상품
              </h2>
              <p className="text-gray-500 mt-2">가장 인기있는 상품들을 만나보세요</p>
            </div>
            <Link href="/shop?sort=best" className="hidden md:flex items-center gap-1 text-purple-600 font-semibold hover:gap-2 transition-all">
              전체보기 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bestProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            지금 바로 AI와 함께
            <br />
            나만의 굿즈를 만들어보세요
          </h2>
          <p className="text-purple-200 text-lg mb-8 max-w-2xl mx-auto">
            아이디어만 있으면 됩니다. 제작부터 배송까지 모든 것을 저희가 처리합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="px-8 py-4 bg-white text-purple-700 rounded-full font-bold text-lg hover:shadow-lg transition-all"
            >
              상품 둘러보기
            </Link>
            <Link
              href="/create"
              className="px-8 py-4 bg-transparent text-white border-2 border-white/50 rounded-full font-bold text-lg hover:bg-white/10 transition-all group inline-flex items-center justify-center gap-2"
            >
              AI 디자이너에게 부탁하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
