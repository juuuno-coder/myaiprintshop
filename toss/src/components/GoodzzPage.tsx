import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, ShoppingBag, RefreshCw, Check } from 'lucide-react';

type Step = 'style' | 'keyword' | 'generating' | 'pick' | 'order' | 'done';
type Style = { id: string; label: string; emoji: string; desc: string; color: string; bg: string };
type GoodsType = { id: string; label: string; price: number; emoji: string };
type Qty = { count: number; label: string };

const STYLES: Style[] = [
  { id: 'cute', label: '예쁜 감성', emoji: '🌸', desc: '파스텔, 플라워, 부드러운 감성', color: '#FF6B9D', bg: '#FFF0F6' },
  { id: 'witty', label: '위트있는', emoji: '😄', desc: '웃긴 문구, 밈, 유머 넘치는 디자인', color: '#F59E0B', bg: '#FFFBEB' },
  { id: 'vintage', label: '빈티지', emoji: '☕', desc: '레트로, 브라운 톤, 손그림 느낌', color: '#92400E', bg: '#FDF8F0' },
  { id: 'minimal', label: '미니멀', emoji: '◻️', desc: '깔끔, 흑백, 심플한 라인', color: '#374151', bg: '#F9FAFB' },
];

const GOODS: GoodsType[] = [
  { id: 'sticker', label: '스티커', price: 9900, emoji: '🏷️' },
  { id: 'postcard', label: '엽서', price: 12900, emoji: '📮' },
  { id: 'ecobag', label: '에코백', price: 19900, emoji: '👜' },
  { id: 'badge', label: '배지', price: 7900, emoji: '📌' },
];

const QTYS: Qty[] = [
  { count: 50, label: '50장' },
  { count: 100, label: '100장' },
  { count: 200, label: '200장' },
];

// 스타일별 mock 이미지 (이모지 카드로 대체)
const MOCK_IMAGES: Record<string, { emoji: string; desc: string }[]> = {
  cute:    [{ emoji: '🌸', desc: '벚꽃 수채화' }, { emoji: '🐰', desc: '파스텔 토끼' }, { emoji: '🍓', desc: '딸기 일러스트' }, { emoji: '🌷', desc: '핑크 튤립' }],
  witty:   [{ emoji: '😂', desc: '리액션 밈' }, { emoji: '🤌', desc: '손짓 유머' }, { emoji: '🐸', desc: '개구리 밈' }, { emoji: '🙃', desc: '아이러니 표정' }],
  vintage: [{ emoji: '☕', desc: '레트로 카페' }, { emoji: '📻', desc: '70년대 라디오' }, { emoji: '🌿', desc: '보태니컬 드로잉' }, { emoji: '🍂', desc: '가을 낙엽' }],
  minimal: [{ emoji: '◾', desc: '블랙 지오메트리' }, { emoji: '〰️', desc: '심플 라인' }, { emoji: '⬜', desc: '화이트스페이스' }, { emoji: '▲', desc: '미니멀 도형' }],
};

const PLACEHOLDER_KEYWORDS: Record<string, string> = {
  cute: '"봄 카페", "고양이 좋아", "꽃길만 걷자"',
  witty: '"월요일 싫어", "야근중", "커피 없이 못살아"',
  vintage: '"1990년대", "할머니댁 감성", "오래된 책방"',
  minimal: '"less is more", "조용한 하루", "단순하게"',
};

export default function GoodzzPage() {
  const [step, setStep] = useState<Step>('style');
  const [style, setStyle] = useState<Style | null>(null);
  const [keyword, setKeyword] = useState('');
  const [pickedImg, setPickedImg] = useState(0);
  const [goods, setGoods] = useState<GoodsType>(GOODS[0]);
  const [qty, setQty] = useState<Qty>(QTYS[1]);

  const images = style ? MOCK_IMAGES[style.id] : [];
  const total = goods.price * (qty.count / 100);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <AnimatePresence mode="wait">

        {/* 1. 스타일 선택 */}
        {step === 'style' && (
          <motion.div key="style" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col min-h-screen px-5 pt-14 pb-10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={20} className="text-pink-400" />
              <span className="text-xs font-bold text-pink-400 tracking-wide">AI 굿즈 제작소</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">어떤 감성으로<br />만들까요?</h1>
            <p className="text-sm text-gray-400 mb-8">스타일을 고르면 AI가 이미지를 만들어드려요</p>
            <div className="grid grid-cols-2 gap-3 flex-1">
              {STYLES.map((s, i) => (
                <motion.button key={s.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setStyle(s); setStep('keyword'); }}
                  className="flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all"
                  style={{ backgroundColor: s.bg, borderColor: s.color + '40' }}
                >
                  <span className="text-4xl mb-2">{s.emoji}</span>
                  <span className="font-black text-sm" style={{ color: s.color }}>{s.label}</span>
                  <span className="text-xs text-gray-400 mt-1 text-center">{s.desc}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* 2. 키워드 입력 */}
        {step === 'keyword' && style && (
          <motion.div key="keyword" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col min-h-screen px-5 pt-14 pb-10">
            <button onClick={() => setStep('style')} className="text-xs text-gray-400 mb-6">← 스타일 다시 고르기</button>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
              style={{ backgroundColor: style.bg }}>{style.emoji}</div>
            <h2 className="text-xl font-black text-gray-900 mb-1">어떤 내용으로<br />만들까요?</h2>
            <p className="text-sm text-gray-400 mb-2">예시: {PLACEHOLDER_KEYWORDS[style.id]}</p>
            <textarea
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="키워드나 문구를 입력하세요"
              rows={3}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none resize-none mb-2 mt-4"
              style={{ borderColor: keyword ? style.color : undefined }}
            />
            <p className="text-xs text-gray-300 mb-8">짧을수록 좋아요 (10자 이내 추천)</p>
            <div className="flex-1" />
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => { if (keyword.trim()) { setStep('generating'); setTimeout(() => setStep('pick'), 2000); } }}
              className="w-full py-4 rounded-2xl font-black text-base text-white transition-opacity"
              style={{ backgroundColor: keyword.trim() ? style.color : '#E5E5EA' }}
            >
              AI 이미지 4장 생성하기
            </motion.button>
          </motion.div>
        )}

        {/* 3. 생성 중 */}
        {step === 'generating' && style && (
          <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              className="w-16 h-16 rounded-full border-4 border-gray-100 mb-6"
              style={{ borderTopColor: style.color }} />
            <p className="font-bold text-gray-900 mb-1">AI가 이미지 만드는 중...</p>
            <p className="text-sm text-gray-400">"{keyword}" 감성으로 4장 제작 중</p>
          </motion.div>
        )}

        {/* 4. 이미지 선택 */}
        {step === 'pick' && style && (
          <motion.div key="pick" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col min-h-screen px-5 pt-14 pb-10">
            <h2 className="text-xl font-black text-gray-900 mb-1">마음에 드는<br />이미지를 골라요</h2>
            <p className="text-sm text-gray-400 mb-6">"{keyword}" · {style.label}</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {images.map((img, i) => (
                <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => setPickedImg(i)}
                  className="relative aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all"
                  style={{
                    backgroundColor: style.bg,
                    borderColor: pickedImg === i ? style.color : 'transparent',
                  }}
                >
                  <span className="text-5xl mb-2">{img.emoji}</span>
                  <span className="text-xs text-gray-500">{img.desc}</span>
                  {pickedImg === i && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: style.color }}>
                      <Check size={12} color="white" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('keyword')}
                className="flex items-center gap-1 text-sm text-gray-400 px-4 py-3 rounded-2xl bg-gray-50">
                <RefreshCw size={14} /> 재생성
              </button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep('order')}
                className="flex-1 py-3 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: style.color }}>
                이 이미지로 굿즈 만들기 <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* 5. 굿즈/수량 선택 */}
        {step === 'order' && style && (
          <motion.div key="order" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col min-h-screen px-5 pt-14 pb-10">
            <h2 className="text-xl font-black text-gray-900 mb-6">굿즈 종류와 수량</h2>

            {/* 선택된 이미지 미리보기 */}
            <div className="flex items-center gap-3 p-4 rounded-2xl mb-6" style={{ backgroundColor: style.bg }}>
              <span className="text-4xl">{images[pickedImg]?.emoji}</span>
              <div>
                <p className="font-bold text-sm text-gray-900">{images[pickedImg]?.desc}</p>
                <p className="text-xs text-gray-400">"{keyword}" · {style.label}</p>
              </div>
            </div>

            <p className="text-xs font-bold text-gray-500 mb-2">굿즈 종류</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {GOODS.map(g => (
                <button key={g.id} onClick={() => setGoods(g)}
                  className="flex items-center gap-3 p-3 rounded-2xl border-2 transition-all"
                  style={{ borderColor: goods.id === g.id ? style.color : '#F0F0F0', backgroundColor: goods.id === g.id ? style.bg : 'white' }}>
                  <span className="text-xl">{g.emoji}</span>
                  <div className="text-left">
                    <p className="font-bold text-sm text-gray-900">{g.label}</p>
                    <p className="text-xs text-gray-400">100장 {g.price.toLocaleString()}원</p>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-xs font-bold text-gray-500 mb-2">수량</p>
            <div className="flex gap-2 mb-8">
              {QTYS.map(q => (
                <button key={q.count} onClick={() => setQty(q)}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all"
                  style={{ borderColor: qty.count === q.count ? style.color : '#F0F0F0', color: qty.count === q.count ? style.color : '#8B8B9B', backgroundColor: qty.count === q.count ? style.bg : 'white' }}>
                  {q.label}
                </button>
              ))}
            </div>

            <div className="flex-1" />
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{goods.label} {qty.count}장</span>
                <span className="font-black text-gray-900">{total.toLocaleString()}원</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">영업일 5일 내 배송 · 인쇄 전 최종 확인 문자 발송</p>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep('done')}
              className="w-full py-4 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: style.color }}>
              <ShoppingBag size={18} />
              {total.toLocaleString()}원 결제하기
            </motion.button>
          </motion.div>
        )}

        {/* 6. 완료 */}
        {step === 'done' && style && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6"
              style={{ backgroundColor: style.bg }}>
              {images[pickedImg]?.emoji}
            </motion.div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">주문 완료!</h2>
            <p className="text-sm text-gray-400 mb-1">영업일 5일 내 배송 예정이에요</p>
            <p className="text-sm text-gray-400 mb-8">인쇄 전 최종 확인 문자를 보내드려요</p>
            <button onClick={() => { setStep('style'); setKeyword(''); setStyle(null); }}
              className="text-sm font-bold px-6 py-3 rounded-2xl"
              style={{ color: style.color, backgroundColor: style.bg }}>
              다른 굿즈 만들기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
