'use client';

import React from 'react';
import ReviewCard from './ReviewCard';
import { motion } from 'framer-motion';
import { Camera, Star, MessageSquare } from 'lucide-react';

interface Review {
  id: string;
  userName: string;
  rating: number;
  content: string;
  images?: string[];
  createdAt: string;
}

interface ReviewGridProps {
  reviews: Review[];
  isLoading?: boolean;
}

export default function ReviewGrid({ reviews, isLoading }: ReviewGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-gray-100 rounded-[2.5rem]" />
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-24 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <MessageSquare className="text-gray-200" size={32} />
        </div>
        <h3 className="text-lg font-black text-gray-900 tracking-tight">첫 번째 리뷰를 기다리고 있어요</h3>
        <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
          이 제품을 가장 먼저 경험하고 나만의 세련된 포토 후기를 남겨주세요.
        </p>
      </div>
    );
  }

  // Calculate average rating
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-12">
      {/* Reviews Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-3">Average Rating</p>
          <div className="text-5xl font-black text-gray-900 mb-4">{avgRating.toFixed(1)}</div>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className={i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-100"}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 font-bold tracking-tight">Based on {reviews.length} reviews</p>
        </div>

        <div className="md:col-span-2 bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                 <h3 className="text-2xl font-black tracking-tight mb-2">사장님들의 생생한 포토 후기</h3>
                 <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                   실제 구매 고객님들이 AI로 디자인하고 제작한 굿즈의<br />
                   리얼한 퀄리티를 지금 바로 확인해보세요.
                 </p>
              </div>
              <div className="flex items-center gap-4 mt-8">
                <div className="flex -space-x-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="user" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-gray-900 bg-primary-600 flex items-center justify-center text-[10px] font-black">
                     +{reviews.length}
                  </div>
                </div>
                <div className="text-xs font-bold text-gray-300">verified customers</div>
              </div>
           </div>
           
           <Camera size={180} className="absolute right-[-40px] bottom-[-40px] text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
        </div>
      </div>

      {/* Masonry-like Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
        {reviews.map((review, idx) => (
          <div key={review.id} className="break-inside-avoid">
            <ReviewCard review={review} index={idx} />
          </div>
        ))}
      </div>

      {/* Load More UI (Visual only for now) */}
      {reviews.length > 6 && (
        <div className="text-center pt-8">
           <button className="px-10 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-900 hover:bg-gray-50 transition-all shadow-sm">
             Load More Reviews
           </button>
        </div>
      )}
    </div>
  );
}
