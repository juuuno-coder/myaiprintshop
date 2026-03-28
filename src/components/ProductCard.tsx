'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '../lib/mock-data';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const discountRate = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const getBadgeStyles = (badge: string) => {
    switch (badge) {
      case 'BEST':
        return 'bg-amber-500 text-zinc-950';
      case 'NEW':
        return 'bg-zinc-100 text-zinc-900';
      case 'HOT':
        return 'bg-red-500 text-white';
      default:
        return 'bg-zinc-800 text-zinc-100 border border-white/10';
    }
  };

  const glassStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(12px)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 10) * 0.05 }}
    >
      <Link href={`/shop/${product.id}`} className="group block rounded-[24px] p-3 transition-all duration-300 hover:-translate-y-1" style={glassStyle}>
        <div className="relative overflow-hidden rounded-[16px] bg-zinc-800 mb-4 aspect-square">
          {/* Badge */}
          {product.badge && (
            <div
              className={`absolute top-3 left-3 z-10 ${getBadgeStyles(product.badge)} text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm uppercase`}
            >
              {product.badge === 'NEW' && <span className="text-zinc-600">✨</span>}
              {product.badge}
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
            style={{
              background: 'rgba(9,9,11,0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {/* @ts-ignore */}
            <iconify-icon 
              icon={isLiked ? "solar:heart-bold" : "solar:heart-linear"} 
              class={`text-lg ${isLiked ? 'text-amber-500' : 'text-zinc-400'}`} 
            />
          </button>

          {/* Image */}
          <img
            src={product.thumbnail}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          />

          {/* Quick Action Overlay */}
          <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <div className="bg-amber-500 text-zinc-950 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-xl">
                상세보기
                {/* @ts-ignore */}
                <iconify-icon icon="solar:arrow-right-linear" class="text-base" />
            </div>
          </div>

          {/* Discount Badge */}
          {discountRate > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full">
              -{discountRate}%
            </div>
          )}
        </div>

        <div className="px-2 pb-2">
          <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1.5">
            {product.category}
          </div>
          <h3 className="font-bold text-white line-clamp-2 mb-3 leading-snug tracking-tight text-base group-hover:text-amber-400 transition-colors" style={{ wordBreak: 'keep-all' }}>
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-black text-xl text-white tracking-tighter" style={{ fontFamily: "'Outfit',sans-serif" }}>
                {product.price.toLocaleString()}<span className="text-sm">원</span>
              </span>
              {product.originalPrice && (
                <span className="text-xs text-zinc-500 line-through" style={{ fontFamily: "'Outfit',sans-serif" }}>
                  {product.originalPrice.toLocaleString()}원
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-bold text-zinc-300" style={{ background: 'rgba(255,255,255,0.05)' }}>
               {/* @ts-ignore */}
               <iconify-icon icon="solar:star-bold" class="text-amber-500 text-xs" />
               <span>{product.rating}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
