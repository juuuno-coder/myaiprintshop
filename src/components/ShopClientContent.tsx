'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

interface ShopClientContentProps {
  products: any[];
  category?: string;
  subcategory?: string;
  query?: string;
  currentCategory: any;
  allCategories: any[];
}

export default function ShopClientContent({
  products,
  category,
  subcategory,
  query,
  currentCategory,
  allCategories,
}: ShopClientContentProps) {
  return (
    <div className="min-h-[100dvh]">
      {/* Background radial gradients for Dark Theme */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: `
            radial-gradient(circle at 100% 0%, rgba(245,158,11,0.06) 0%, transparent 50%),
            radial-gradient(circle at 0% 100%, rgba(245,158,11,0.04) 0%, transparent 50%)
          `
        }}
      />

      {/* Premium Shop Header */}
      <div className="relative pt-32 pb-20 overflow-hidden text-center">
        <div className="max-w-7xl mx-auto px-4">
          {query ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-amber-500 font-bold mb-4 block uppercase tracking-widest text-xs">
                Search Results
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight" style={{ wordBreak: 'keep-all' }}>
                "{query}"
              </h1>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter shadow-sm" style={{ fontFamily: "'Outfit','Pretendard',sans-serif", wordBreak: 'keep-all' }}>
                {currentCategory ? currentCategory.label : '모든 상품 보기'}
              </h1>
              <p className="text-zinc-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                프리미엄 퀄리티로 완성되는 나만의 굿즈.
                전 세계 어디서든 가장 쉬운 제작을 시작하세요.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Premium Category Filter */}
        {!query && (
          <div className="mb-16">
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/shop"
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                  !category
                    ? 'bg-amber-500 text-zinc-950'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                전체보기
              </Link>
              {allCategories.map(cat => {
                const isActive = category === cat.slug;
                return (
                  <Link
                    key={cat.slug}
                    href={`/shop?category=${cat.slug}`}
                    className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {cat.label}
                  </Link>
                );
              })}
            </div>

            {/* Subcategories */}
            {currentCategory && currentCategory.subcategories && currentCategory.subcategories.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center gap-2 mt-8 flex-wrap"
              >
                <Link
                  href={`/shop?category=${category}`}
                  className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all ${
                    !subcategory
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  All
                </Link>
                {currentCategory.subcategories.map((sub: any) => {
                  const isActive = subcategory === sub.slug;
                  return (
                    <Link
                      key={sub.slug}
                      href={`/shop?category=${category}&subcategory=${sub.slug}`}
                      className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}

        {/* Product Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product: any, index: number) => (
             <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="py-24 text-center glass rounded-3xl mt-10">
            {/* @ts-ignore */}
            <iconify-icon icon="solar:ghost-bold" class="text-6xl text-zinc-700 mb-4" />
            <p className="text-xl font-bold text-zinc-300">검색 결과가 없습니다.</p>
            <p className="text-zinc-500 mt-2">다른 검색어나 카테고리를 선택해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
