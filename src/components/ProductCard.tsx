
import React from 'react';
import Link from 'next/link';
import { Product } from '../lib/mock-data';
import { Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discountRate = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link href={`/shop/${product.id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-gray-100 mb-3 aspect-square border border-gray-100">
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10 bg-black text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            {product.badge}
          </div>
        )}
        
        {/* Image with hover effect */}
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Overlay (Optional: Add specific overlay for out of stock, etc.) */}
      </div>

      <div className="space-y-1">
        <div className="text-xs text-gray-500 font-medium">{product.category}</div>
        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2">
          {product.originalPrice && (
             <span className="text-sm text-gray-400 line-through">
               {product.originalPrice.toLocaleString()}원
             </span>
          )}
          <span className="font-bold text-lg text-gray-900">
            {product.price.toLocaleString()}원
          </span>
          {discountRate > 0 && (
            <span className="text-sm font-bold text-red-500">
              {discountRate}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="font-medium text-gray-900">{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>
      </div>
    </Link>
  );
}
