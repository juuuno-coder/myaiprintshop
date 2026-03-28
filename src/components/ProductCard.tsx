'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '../lib/mock-data';
import { Star, Heart, ShoppingCart, Sparkles, ArrowRight } from 'lucide-react';
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
        return 'bg-gray-900 text-white';
      case 'NEW':
        return 'bg-primary-600 text-white';
      case 'HOT':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-700 text-white';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 10) * 0.05 }}
    >
      <Link href={`/shop/${product.id}`} className="group block premium-card p-3">
        <div className="relative overflow-hidden rounded-[18px] bg-gray-50 mb-4 aspect-square">
          {/* Badge */}
          {product.badge && (
            <div
              className={`absolute top-4 left-4 z-10 ${getBadgeStyles(product.badge)} text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm`}
            >
              {product.badge === 'NEW' && <Sparkles className="w-3 h-3" />}
              {product.badge}
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="absolute top-4 right-4 z-10 w-10 h-10 glass rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
          >
            <Heart
              className={`w-5 h-5 ${
                isLiked ? 'fill-primary-500 text-primary-500' : 'text-gray-400'
              }`}
            />
          </button>

          {/* Image */}
          <img
            src={product.thumbnail}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
          />

          {/* Quick Action Overlay */}
          <div className="absolute inset-x-4 bottom-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <div className="bg-gray-900/90 backdrop-blur-md text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
                상세보기 <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Discount Badge */}
          {discountRate > 0 && (
            <div className="absolute top-4 left-4 bg-primary-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full">
              -{discountRate}%
            </div>
          )}
        </div>

        <div className="px-2 pb-2">
          <div className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1.5">
            {product.category}
          </div>
          <h3 className="font-display font-bold text-gray-900 line-clamp-2 mb-3 leading-snug tracking-tight text-lg group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-display font-black text-xl text-gray-900 tracking-tighter">
                {product.price.toLocaleString()}원
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {product.originalPrice.toLocaleString()}원
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 glass px-2 py-1 rounded-full text-[11px] font-bold text-gray-600">
               <Star className="w-3 h-3 fill-accent-500 text-accent-500" />
               <span>{product.rating}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
