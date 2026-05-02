'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AIAssistantChat from './AIAssistantChat';

// 플로팅 버튼을 숨길 페이지들
const HIDDEN_PATHS = ['/admin', '/vendor', '/studio'];

export default function AIAssistantFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // 특정 페이지에서는 숨김
  const shouldHide = HIDDEN_PATHS.some(p => pathname?.startsWith(p));

  useEffect(() => {
    // 마운트 후 살짝 딜레이 후 표시 (페이지 로딩 완료 후)
    const t = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (shouldHide) return null;

  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 채팅 패널 */}
      <div
        className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ height: '520px' }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-900 text-xs font-black">
              AI
            </div>
            <div>
              <p className="text-sm font-bold text-white">GOODZZ 어시스턴트</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                <span className="text-xs text-gray-300">온라인</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 채팅 */}
        <div className="h-[calc(520px-65px)]">
          {isOpen && (
            <AIAssistantChat
              context={`현재 페이지: ${pathname}`}
              onDesignGenerate={(prompt, style) => {
                setIsOpen(false);
                window.location.href = `/create?prompt=${encodeURIComponent(prompt)}&style=${style}`;
              }}
            />
          )}
        </div>
      </div>

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 bg-gray-900 text-white rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 hover:bg-black hover:scale-105 active:scale-95 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } ${isOpen ? 'rotate-0' : ''}`}
        aria-label="AI 어시스턴트 열기"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        )}

        {/* 알림 뱃지 (처음 방문 시) */}
        {!isOpen && isVisible && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
            1
          </span>
        )}
      </button>
    </>
  );
}
