'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Store } from 'lucide-react';

interface Brand {
  id: string;
  businessName: string;
  slug: string;
  logo: string | null;
  shortBio: string | null;
  category: string | null;
  themeColor: string;
  totalProducts: number;
}

export default function LandingBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    fetch('/api/store')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setBrands(data.brands.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  if (brands.length === 0) return null;

  return (
    <section className="py-24 px-4 relative" style={{ background: 'linear-gradient(180deg, #09090b 0%, #18181b 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-purple-400 text-sm font-bold tracking-widest uppercase mb-3 block">Featured Brands</span>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            입점 브랜드를 만나보세요
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            각 브랜드만의 개성 있는 굿즈를 둘러보세요
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={`/store/${brand.slug}`}
                className="group block rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/5"
                style={{ background: '#1c1c1f' }}
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: brand.themeColor }}
                    >
                      {brand.logo ? (
                        <Image src={brand.logo} alt="" width={44} height={44} className="w-full h-full object-cover" />
                      ) : (
                        brand.businessName.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors truncate">
                        {brand.businessName}
                      </h3>
                      {brand.category && (
                        <span className="text-[11px] text-zinc-500">{brand.category}</span>
                      )}
                    </div>
                  </div>
                  {brand.shortBio && (
                    <p className="text-zinc-500 text-xs line-clamp-2 mb-3">{brand.shortBio}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-600">{brand.totalProducts}개 상품</span>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-700 text-zinc-300 hover:text-white hover:border-purple-500 transition-all text-sm font-medium"
          >
            <Store className="w-4 h-4" />
            전체 브랜드 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
