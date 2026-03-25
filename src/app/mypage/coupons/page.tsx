'use client';

import React from 'react';
import { Ticket, Info } from 'lucide-react';

export default function CouponPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">쿠폰함</h1>
        <button className="text-sm text-gray-500 hover:text-black flex items-center gap-1">
             <Info className="w-4 h-4" /> 쿠폰 이용안내
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 flex gap-4 items-center mb-8">
           <input 
             type="text" 
             placeholder="쿠폰 번호를 입력하세요" 
             className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
           />
           <button className="px-6 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800">
               쿠폰 등록
           </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Coupon Card */}
           <div className="border border-purple-100 bg-purple-50 rounded-xl p-0 flex h-32 overflow-hidden relative">
               <div className="w-8 border-r-2 border-dashed border-purple-200 bg-purple-100 relative flex flex-col justify-between py-2 items-center">
                   <div className="w-4 h-4 rounded-full bg-white -mt-4 shadow-inner" />
                   <span className="vertical-rl text-xs text-purple-400 font-bold tracking-widest writing-mode-vertical" style={{ writingMode: 'vertical-lr' }}>COUPON</span>
                   <div className="w-4 h-4 rounded-full bg-white -mb-4 shadow-inner" />
               </div>
               <div className="flex-1 p-5 flex flex-col justify-between">
                   <div>
                       <h3 className="font-bold text-lg text-gray-900">신규 회원 가입 환영 쿠폰</h3>
                       <p className="text-purple-600 font-bold text-2xl">3,000원</p>
                   </div>
                   <div className="flex justify-between items-end text-xs text-gray-500">
                       <span>30,000원 이상 구매 시 사용 가능</span>
                       <span>~ 2024.12.31까지</span>
                   </div>
               </div>
           </div>
           
           {/* Another Coupon */}
           <div className="border border-blue-100 bg-blue-50 rounded-xl p-0 flex h-32 overflow-hidden relative grayscale opacity-60">
               <div className="w-8 border-r-2 border-dashed border-blue-200 bg-blue-100 relative flex flex-col justify-between py-2 items-center">
                   <div className="w-4 h-4 rounded-full bg-white -mt-4 shadow-inner" />
                   <span className="vertical-rl text-xs text-blue-400 font-bold tracking-widest writing-mode-vertical" style={{ writingMode: 'vertical-lr' }}>USED</span>
                   <div className="w-4 h-4 rounded-full bg-white -mb-4 shadow-inner" />
               </div>
               <div className="flex-1 p-5 flex flex-col justify-between">
                   <div>
                       <h3 className="font-bold text-lg text-gray-900">첫 주문 감사 무료배송</h3>
                       <p className="text-blue-600 font-bold text-2xl">무료배송</p>
                   </div>
                   <div className="flex justify-between items-end text-xs text-gray-500">
                       <span>사용 완료</span>
                       <span>2024.05.01 사용</span>
                   </div>
               </div>
           </div>
      </div>
    </div>
  );
}
