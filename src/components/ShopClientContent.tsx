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
    <div className="min-h-screen bg-white">
      {/* Premium Shop Header */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-50/30 -z-10 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-1/4 h-full bg-accent-50/30 -z-10 blur-3xl opacity-50" />
        
        <div className="container mx-auto px-4 text-center">
          {query ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-primary-600 font-black mb-4 block uppercase tracking-widest text-xs">
                Search Results
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-black text-gray-900 leading-tight tracking-tighter">
                "{query}"
              </h1>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-5xl md:text-7xl font-display font-black text-gray-900 mb-6 tracking-tighter">
                {currentCategory ? currentCategory.label : '글로벌 커스텀 굿즈'}
              </h1>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
                프리미엄 퀄리티로 완성되는 나만의 브랜드.<br className="hidden md:block" />
                전 세계 어디서든 가장 쉬운 굿즈 제작 경험을 시작하세요.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 pb-32">
        {/* Premium Category Filter */}
        {!query && (
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/shop"
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all shadow-sm ${
                  !category
                    ? 'bg-gray-900 text-white shadow-gray-200'
                    : 'bg-white text-gray-500 border border-black/5 hover:border-gray-200 hover:text-gray-900'
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
                    className={`px-8 py-3 rounded-full text-sm font-bold transition-all shadow-sm ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-gray-200'
                        : 'bg-white text-gray-500 border border-black/5 hover:border-gray-200 hover:text-gray-900'
                    }`}
                  >
                    {cat.label}
                  </Link>
                );
              })}
            </div>

            {/* Subcategories (Enhanced) */}
            {currentCategory && currentCategory.subcategories && currentCategory.subcategories.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center gap-1.5 mt-8"
              >
                <Link
                  href={`/shop?category=${category}`}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all ${
                    !subcategory
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
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
                      className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all ${
                        isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-400 hover:text-gray-600'
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

        {/* Product Grid with Masonry Layout */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {products.map((product: any, index: number) => (
            <div key={product.id} className="break-inside-avoid mb-6">
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-2xl font-bold text-gray-300">검색 결과가 없습니다.</p>
            <p className="text-gray-400 mt-2">다른 검색어를 입력해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
