'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/payment';

const glassStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(12px)',
};

export default function MyPageDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState({ shipping: 0, coupons: 3, points: '2,500' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/orders?userId=${user.uid}`);
        const data = await response.json();
        if (data.success && data.orders.length > 0) {
          const orders = data.orders as Order[];
          setRecentOrder(orders[0]); // 가장 최근 주문
          
          // 배송 중 상태 카운트
          const shippingCount = orders.filter(o => ['SHIPPED', 'PREPARING'].includes(o.orderStatus)).length;
          setStats(prev => ({ ...prev, shipping: shippingCount }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: '결제대기',
      PAID: '결제완료',
      PREPARING: '배송준비',
      SHIPPED: '배송중',
      DELIVERED: '배송완료',
      CANCELLED: '취소됨',
    };
    return labels[status] || status;
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        {/* @ts-ignore */}
        <iconify-icon icon="solar:spinner-linear" class="animate-spin text-amber-500 text-4xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">대시보드</h1>
          <p className="text-zinc-500 text-sm mt-2 font-medium">
            {user ? `${user.displayName || '회원'}님, 환영합니다.` : '로그인이 필요합니다.'}
          </p>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {[
            { label: '배송중/준비중', value: stats.shipping, icon: 'solar:truck-bold', color: 'text-blue-400', bg: 'bg-blue-500/10 border border-blue-500/20' },
            { label: '보유 쿠폰', value: stats.coupons, icon: 'solar:ticket-bold', color: 'text-purple-400', bg: 'bg-purple-500/10 border border-purple-500/20' },
            { label: '포인트', value: `${stats.points}P`, icon: 'solar:star-circle-bold', color: 'text-amber-400', bg: 'bg-amber-500/10 border border-amber-500/20' },
        ].map((stat) => (
            <div key={stat.label} className="p-6 rounded-3xl flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-transform cursor-default" style={glassStyle}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} mb-1`}>
                    {/* @ts-ignore */}
                    <iconify-icon icon={stat.icon} class="text-2xl" />
                </div>
                <span className="text-3xl font-black text-white" style={{ fontFamily: "'Outfit',sans-serif" }}>{stat.value}</span>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
            </div>
        ))}
      </div> 

      {/* Recent Activity */}
      <div className="p-8 rounded-3xl" style={glassStyle}>
        <div className="flex justify-between items-center mb-8">
            <h2 className="font-bold text-white text-lg">최근 주문 내역</h2>
            <Link href="/mypage/orders" className="text-sm font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 group transition-colors">
                전체보기
                {/* @ts-ignore */}
                <iconify-icon icon="solar:alt-arrow-right-linear" class="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>

        <div className="space-y-4">
            {recentOrder ? (
                <div className="flex gap-4 md:gap-6 p-5 rounded-2xl bg-black/40 border border-white/5 group hover:border-amber-500/50 transition-colors cursor-pointer" onClick={() => window.location.href='/mypage/orders'}>
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-900 rounded-xl overflow-hidden shrink-0 border border-white/5 relative flex items-center justify-center p-2">
                        {recentOrder.items[0].options?.customDesign ? (
                          <Image
                            src={recentOrder.items[0].options.customDesign}
                            className="object-contain drop-shadow-lg"
                            alt="Recent product"
                            fill
                            unoptimized
                          />
                        ) : (
                          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                            {/* @ts-ignore */}
                            <iconify-icon icon="solar:box-minimalistic-bold" class="text-zinc-600 text-xl" />
                          </div>
                        )}
                        {recentOrder.items[0].options?.customDesign && (
                          <div className="absolute top-1 left-1 bg-amber-500 text-zinc-950 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shadow-sm">AI</div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-widest ${
                                  ['SHIPPED', 'DELIVERED'].includes(recentOrder.orderStatus) ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-white/10 text-white border border-white/10'
                                }`}>
                                   {getStatusLabel(recentOrder.orderStatus)}
                                </span>
                                <h3 className="font-bold text-white mt-3 truncate max-w-full text-lg">
                                  {recentOrder.items[0].productName} {recentOrder.items.length > 1 && <span className="text-zinc-400 text-base font-medium">외 {recentOrder.items.length - 1}건</span>}
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1 font-mono flex items-center gap-2">
                                  {/* @ts-ignore */}
                                  <iconify-icon icon="solar:calendar-linear" />
                                  {new Date(recentOrder.createdAt).toLocaleDateString()} 주문 ({recentOrder.id.slice(0, 12)}...)
                                </p>
                            </div>
                            <div className="hidden sm:flex text-xs font-bold text-zinc-400 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all items-center gap-1.5 shrink-0">
                                상세
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-black/20 rounded-2xl border border-dashed border-white/10 mt-2">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      {/* @ts-ignore */}
                      <iconify-icon icon="solar:box-minimalistic-linear" class="text-zinc-500 text-3xl" />
                    </div>
                    <p className="text-zinc-400 text-sm font-medium">최근 주문 내역이 없습니다.</p>
                    <Link href="/shop" className="text-amber-500 font-bold mt-6 py-2 px-6 rounded-full border border-amber-500/30 inline-block hover:bg-amber-500/10 transition-colors text-sm">
                        쇼핑하러 가기
                    </Link>
                </div>
            )}
        </div>
      </div>

      {/* Recommended Section (Visual Only) */}
      <div className="p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden group shadow-2xl" style={{ ...glassStyle, background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.05) 100%)', borderColor: 'rgba(245,158,11,0.2)' }}>
          <div className="relative z-10 w-full md:w-auto text-center md:text-left">
              <span className="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Event</span>
              <h2 className="text-2xl font-black mb-2 text-white">리뷰 작성하고 <span className="text-amber-500">포인트 2배</span> 받기</h2>
              <p className="text-zinc-300 text-sm opacity-90 mb-6 md:mb-0">구매 후 정성스러운 후기를 남겨주시면 5,000P를 드립니다.</p>
          </div>
          <button className="z-10 bg-amber-500 text-zinc-950 px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg hover:bg-amber-400 transition-colors w-full md:w-auto active:scale-95 flex items-center justify-center gap-2">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:pen-new-round-bold" class="text-lg" />
              리뷰 작성하기
          </button>
          
          <div className="absolute right-[-40px] top-[-40px] opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:gift-bold" style={{ fontSize: '200px', color: '#f59e0b' }} />
          </div>
      </div>
    </div>
  );
}
