'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AIAssistantChat from '@/components/AIAssistantChat';

export const dynamic = 'force-dynamic';

export default function AIPage() {
  const [generatedDesign, setGeneratedDesign] = useState<{ url: string; prompt: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDesignGenerate = async (prompt: string, style: string) => {
    setIsGenerating(true);
    setGeneratedDesign(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedDesign({ url: data.imageUrl, prompt });
      }
    } catch {
      // 실패 시 조용히 처리
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 pt-28 pb-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Link href="/" className="hover:text-gray-700">홈</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">AI 어시스턴트</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">AI 어시스턴트</h1>
          <p className="text-gray-500 mt-2">업종을 알려주시면 굿즈 추천부터 디자인 생성까지 한 번에 도와드려요.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ height: 'calc(100vh - 280px)', minHeight: '520px' }}>
          {/* 좌측: 채팅 */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-900">
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
            </div>
            <div className="flex-1 min-h-0">
              <AIAssistantChat
                context="AI 어시스턴트 전용 페이지 - 굿즈 추천, 디자인 생성, 상품 검색 전문"
                onDesignGenerate={handleDesignGenerate}
                initialMessage="안녕하세요! GOODZZ AI 어시스턴트예요.

어떤 굿즈를 만들고 싶으신가요?
업종이나 브랜드를 알려주시면 바로 도와드릴게요."
                placeholder="예: 카페 운영 중인데 굿즈 뭐가 좋을까요?"
              />
            </div>
          </div>

          {/* 우측: 디자인 프리뷰 */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">디자인 프리뷰</h2>
              <p className="text-xs text-gray-400 mt-0.5">AI가 생성한 디자인이 여기 표시돼요</p>
            </div>

            <div className="flex-1 flex items-center justify-center p-8">
              {isGenerating ? (
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-600">디자인 생성 중...</p>
                  <p className="text-xs text-gray-400 mt-1">Gemini AI가 작업 중이에요</p>
                </div>
              ) : generatedDesign ? (
                <div className="w-full space-y-4">
                  <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 max-w-sm mx-auto">
                    <Image
                      src={generatedDesign.url}
                      alt="Generated design"
                      fill
                      className="object-contain p-4"
                      unoptimized
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-center line-clamp-2">{generatedDesign.prompt}</p>
                  <div className="flex gap-3 justify-center">
                    <Link
                      href={`/create?designUrl=${encodeURIComponent(generatedDesign.url)}`}
                      className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors"
                    >
                      이 디자인으로 제작하기
                    </Link>
                    <button
                      onClick={() => setGeneratedDesign(null)}
                      className="px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      다시 생성
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center max-w-xs">
                  <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09 3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500">왼쪽 채팅에서</p>
                  <p className="text-sm text-gray-400 mt-0.5">"디자인 만들어줘"라고 말해보세요</p>

                  <div className="mt-6 space-y-2 text-left">
                    {[
                      '모던한 카페 로고 디자인 만들어줘',
                      '귀여운 캐릭터 스티커 이미지 생성해줘',
                      '미니멀 브랜드 머그컵 디자인',
                    ].map(ex => (
                      <button
                        key={ex}
                        className="w-full text-left text-xs text-gray-400 bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2 transition-colors"
                      >
                        "{ex}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
