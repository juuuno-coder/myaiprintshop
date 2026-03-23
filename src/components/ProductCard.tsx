'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '../lib/mock-data';
import { Star, Heart, ShoppingCart, Sparkles } from 'lucide-react';

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
        return 'bg-amber-500 text-white';
      case 'NEW':
        return 'bg-purple-600 text-white';
      case 'HOT':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-700 text-white';
    }
  };

  return (
    <div>
      <Link href={`/shop/${product.id}`} className="group block">
        <div className="relative overflow-hidden rounded-xl bg-gray-50 mb-3 aspect-square border border-gray-100 hover:shadow-md transition-shadow duration-200">
          {/* Badge */}
          {product.badge && (
            <div
              className={`absolute top-3 left-3 z-10 ${getBadgeStyles(product.badge)} text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1`}
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
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <Heart
              className={`w-4 h-4 ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
          </button>

          {/* Quick Add to Cart */}
          <button
            onClick={(e) => {
              e.preventDefault();
            }}
            className="absolute bottom-3 right-3 z-10 px-3 py-1.5 bg-purple-600 text-white rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm font-medium"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            담기
          </button>

          {/* Image */}
          <img
            src={product.thumbnail}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-103"
          />

          {/* Discount Badge */}
          {discountRate > 0 && (
            <div className="absolute bottom-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {discountRate}% OFF
            </div>
          )}
        </div>

        <div className="space-y-1.5 px-0.5">
          <div className="text-xs font-medium text-purple-600 uppercase tracking-wide">
            {product.category}
          </div>
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors text-sm leading-snug">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {product.originalPrice.toLocaleString()}원
              </span>
            )}
            <span className="font-bold text-base text-gray-900">
              {product.price.toLocaleString()}원
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-gray-700">{product.rating}</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400 text-xs">리뷰 {product.reviewCount}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
