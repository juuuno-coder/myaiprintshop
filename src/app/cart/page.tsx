'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function getVolumeDiscountedPrice(item: { price: number; quantity: number; metadata?: Record<string, any> }): number {
  const volumePricing = item.metadata?.volumePricing;
  const baseUnitPrice = item.metadata?.baseUnitPrice;
  if (!volumePricing || !baseUnitPrice) return item.price;

  const sorted = [...volumePricing].sort((a: any, b: any) => b.minQuantity - a.minQuantity);
  const tier = sorted.find((t: any) => item.quantity >= t.minQuantity);
  if (tier) {
    return Math.round(baseUnitPrice * (1 - (tier as any).discountRate));
  }
  return baseUnitPrice;
}

const glassStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(12px)',
};

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-[100dvh]"></div>; // Prevent hydration error

  const subtotal = cart.reduce((acc, item) => {
    const effectivePrice = getVolumeDiscountedPrice(item);
    return acc + effectivePrice * item.quantity;
  }, 0);
  const shipping = subtotal > 50000 ? 0 : 3000;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 pt-32 text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={glassStyle}>
              {/* @ts-ignore */}
              <iconify-icon icon="solar:cart-large-minimalistic-bold" class="text-4xl text-zinc-600" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">장바구니가 비어있습니다</h2>
          <p className="text-zinc-500 mb-10 text-lg">나만의 사진으로 특별한 굿즈를 디자인하고 담아보세요!</p>
          <div className="flex gap-4">
            <Link 
                href="/shop" 
                className="px-8 py-4 bg-white/5 text-zinc-300 rounded-[16px] hover:bg-white/10 hover:text-white transition-colors font-bold flex items-center gap-2"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
                {/* @ts-ignore */}
                <iconify-icon icon="solar:shop-bold" />
                상품 구경하기
            </Link>
            <Link 
                href="/create" 
                className="px-8 py-4 bg-amber-500 text-zinc-950 rounded-[16px] hover:bg-amber-400 transition-colors font-bold flex items-center gap-2"
            >
                {/* @ts-ignore */}
                <iconify-icon icon="solar:magic-stick-3-bold" />
                사진으로 만들기
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 pt-32 min-h-[100dvh]">
        <h1 className="text-3xl font-black text-white mb-10">장바구니 ({cart.length})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div 
                  key={item.cartId} 
                  className="flex gap-4 md:gap-6 p-5 rounded-3xl"
                  style={glassStyle}
              >
                {/* Image */}
                <div className="relative w-28 h-28 md:w-36 md:h-36 bg-zinc-900 rounded-2xl overflow-hidden shrink-0 border border-white/5">
                  <Image src={item.thumbnail} alt={item.name} fill sizes="144px" className="object-cover opacity-80" />
                  
                  {/* Custom Design Overlay */}
                  {item.customDesignUrl && (
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <div className="relative w-2/3 h-2/3 shadow-2xl">
                             <Image
                                src={item.customDesignUrl}
                                className="object-contain"
                                alt="Custom"
                                fill
                                sizes="96px"
                                unoptimized
                             />
                           </div>
                       </div>
                  )}
                  
                  {item.customDesignUrl && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest uppercase">
                          AI 시안
                      </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-white line-clamp-1 pr-4">{item.name}</h3>
                      <button 
                          onClick={() => {
                              removeFromCart(item.cartId);
                              toast.success('상품이 삭제되었습니다.');
                          }}
                          className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                      >
                          {/* @ts-ignore */}
                          <iconify-icon icon="solar:trash-bin-trash-bold" class="text-xl" />
                      </button>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1.5 font-medium">
                      옵션: {item.color} / {item.size}
                    </p>
                    <p className="font-black text-white mt-3 text-lg" style={{ fontFamily: "'Outfit',sans-serif" }}>
                      {item.price.toLocaleString()}원
                    </p>
                  </div>

                  {/* Quantity Control */}
                  <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-xl bg-black/40 border border-white/10 overflow-hidden">
                          <button 
                              onClick={() => updateQuantity(item.cartId, -1)}
                              className="p-2.5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                          >
                              {/* @ts-ignore */}
                              <iconify-icon icon="solar:minus-square-linear" class="text-lg" />
                          </button>
                          <span className="w-10 text-center text-sm font-bold text-white font-mono">{item.quantity}</span>
                          <button 
                              onClick={() => updateQuantity(item.cartId, 1)}
                              className="p-2.5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                          >
                              {/* @ts-ignore */}
                              <iconify-icon icon="solar:add-square-linear" class="text-lg" />
                          </button>
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl p-6 lg:p-8 sticky top-24 space-y-6" style={glassStyle}>
              <h2 className="text-xl font-bold text-white uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                {/* @ts-ignore */}
                <iconify-icon icon="solar:bill-list-bold" class="text-amber-500 text-lg" />
                결제 정보
              </h2>
              
              <div className="space-y-4 text-sm font-medium">
                  <div className="flex justify-between text-zinc-400">
                      <span>총 상품금액</span>
                      <span className="text-white" style={{ fontFamily: "'Outfit',sans-serif" }}>{subtotal.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                      <span>배송비</span>
                      <span className="text-white" style={{ fontFamily: "'Outfit',sans-serif" }}>{shipping === 0 ? '무료' : `${shipping.toLocaleString()}원`}</span>
                  </div>
                  {shipping > 0 && subtotal < 50000 && (
                      <p className="text-xs text-amber-500 text-right mt-1 font-bold">
                          {(50000 - subtotal).toLocaleString()}원 더 담으면 무료배송!
                      </p>
                  )}
              </div>

              <div className="pt-6 mt-2 flex justify-between items-end" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="font-bold text-zinc-300">총 결제 금액</span>
                  <span className="text-3xl font-black text-amber-500" style={{ fontFamily: "'Outfit',sans-serif" }}>{total.toLocaleString()}원</span>
              </div>

              <Link 
                  href="/checkout"
                  className="w-full bg-amber-500 text-zinc-950 font-bold py-4 rounded-[16px] hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-xl mt-4 active:scale-[0.98]"
              >
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:wallet-money-bold" class="text-xl" />
                  주문 진행하기
              </Link>
              
              <p className="text-xs text-zinc-500 text-center flex items-center justify-center gap-1.5 mt-4">
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:info-circle-linear" />
                  할인 코드 및 포인트는 다음 단계에서 적용할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
