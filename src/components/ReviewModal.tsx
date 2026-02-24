'use client';

import React, { useState } from 'react';
import { Star, X, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  onSuccess?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  orderId,
  productId,
  productName,
  userId,
  userName,
  onSuccess
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.length < 10) {
      toast.error('리뷰 내용을 10자 이상 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userId,
          userName,
          orderId,
          rating,
          content,
          images: [], // 이미지 업로드는 추후 구현
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('리뷰가 등록되었습니다. 소중한 의견 감사합니다! ✨');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(data.error || '리뷰 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
          >
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">리뷰 쓰기</h2>
                    <p className="text-gray-500 text-sm mt-1">{productName}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Rating */}
                <div className="flex flex-col items-center gap-3">
                  <p className="font-bold text-gray-700">상품은 만족스러우셨나요?</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="transition-transform active:scale-90"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                      >
                        <Star 
                          size={44} 
                          className={`transition-colors ${
                            star <= (hoverRating || rating) 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-200'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-emerald-600 h-5">
                    {rating === 5 && '최고예요! 아주 만족스러워요 ✨'}
                    {rating === 4 && '좋아요! 생각보다 괜찮네요 😊'}
                    {rating === 3 && '보통이에요. 무난합니다.'}
                    {rating === 2 && '조금 아쉬워요 😢'}
                    {rating === 1 && '별로예요. 실망스럽습니다.'}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block ml-1">Review Content</label>
                  <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="다른 고객들에게 도움이 되도록 솔직한 후기를 남겨주세요 (10자 이상)"
                    className="w-full h-40 p-5 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-gray-300 text-gray-800 leading-relaxed"
                  />
                  <div className="text-right">
                    <span className={`text-[10px] font-bold ${content.length >= 10 ? 'text-emerald-500' : 'text-gray-300'}`}>
                      {content.length} / 10자 이상
                    </span>
                  </div>
                </div>

                {/* Image Upload Placeholder */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block ml-1">Photo (Optional)</label>
                    <div className="flex gap-3">
                        <button 
                            type="button"
                            className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-emerald-300 hover:text-emerald-500 hover:bg-emerald-50 transition-all group"
                        >
                            <Camera size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold">사진 추가</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || content.length < 10}
                    className="w-full py-5 bg-emerald-600 text-white font-black text-lg rounded-3xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3 relative overflow-hidden group"
                  >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" size={24} />
                            작성 중...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
                            리뷰 등록하기
                        </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest leading-loose">
                    작성된 리뷰는 마이테스트에서 확인할 수 있으며,<br />
                    삭제 시 복구되지 않습니다.
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
