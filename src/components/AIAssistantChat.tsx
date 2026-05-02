'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

interface AIAssistantChatProps {
  context?: string;
  onDesignGenerate?: (prompt: string, style: string) => void;
  className?: string;
  placeholder?: string;
  initialMessage?: string;
}

const QUICK_PROMPTS = [
  '카페 굿즈 추천해줘',
  '머그컵 디자인 만들어줘',
  '에코백 검색해줘',
  '상품 설명문 써줘',
];

export default function AIAssistantChat({
  context,
  onDesignGenerate,
  className = '',
  placeholder = '무엇을 도와드릴까요?',
  initialMessage = '안녕하세요! GOODZZ AI 어시스턴트입니다.\n업종이나 원하는 굿즈를 말씀해 주시면 바로 도와드릴게요.',
}: AIAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'assistant', content: initialMessage },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: Message = { id: assistantMsgId, role: 'assistant', content: '', isLoading: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const allMessages = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages, context }),
      });

      if (!res.ok) throw new Error('응답 오류');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'text') {
              accumulated += parsed.content;
              setMessages(prev =>
                prev.map(m => m.id === assistantMsgId
                  ? { ...m, content: accumulated, isLoading: false }
                  : m
                )
              );
            } else if (parsed.type === 'action' && parsed.action === 'generate_design') {
              onDesignGenerate?.(parsed.prompt, parsed.style);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m => m.id === assistantMsgId
          ? { ...m, content: 'AI 연결에 실패했어요. 잠시 후 다시 시도해 주세요.', isLoading: false }
          : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, context, onDesignGenerate]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center shrink-0 text-white text-xs font-black mt-0.5">
                AI
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-gray-900 text-white rounded-tr-sm'
                  : 'bg-gray-100 text-gray-800 rounded-tl-sm'
              }`}
            >
              {msg.isLoading ? (
                <span className="flex gap-1 items-center py-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
        <div className="flex gap-2 items-end bg-white border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-gray-900 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent max-h-24 leading-relaxed"
            style={{ minHeight: '20px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center disabled:opacity-30 hover:bg-black transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
