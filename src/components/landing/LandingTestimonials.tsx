'use client';
import { useEffect, useRef } from 'react';

const REVIEWS = [
  {
    name: '하윤서',
    role: '스텔라랩스 마케팅 팀장',
    avatar: 'https://i.pravatar.cc/150?u=hayounseo22',
    rating: 5,
    text: '처음에는 반신반의했어요. AI가 만든 시안이 이렇게 퀄리티가 좋을 거라고 생각 못했거든요. 명함을 만들었는데 주변 반응이 너무 좋아서 스티커, 포스터까지 연달아 주문했습니다. 이제 디자이너 외주 맡길 일이 없어졌어요.',
    large: true,
  },
  {
    name: '박도현',
    role: '위브스튜디오 대표',
    avatar: 'https://i.pravatar.cc/150?u=parkdohyun44',
    rating: 5,
    text: '행사 D-3에 급하게 굿즈가 필요했는데 정말 빠르게 받았어요. 품질도 기대 이상.',
  },
  {
    name: '이서진',
    role: '루미너스 디자인팀',
    avatar: 'https://i.pravatar.cc/150?u=leeseojinh55',
    rating: 5,
    text: '굿즈 플랫폼을 여러 개 써봤는데 AI 자동 시안 기능은 GOODZZ가 압도적으로 좋습니다.',
  },
  {
    name: '김준우',
    role: '개인 셀러 / 아이돌 굿즈 제작',
    avatar: 'https://i.pravatar.cc/150?u=kimjunwoo22',
    rating: 5,
    text: '해외 팬들에게 굿즈를 보내야 했는데 국제 배송까지 한 번에 해결됐어요. 포장도 깔끔하고 품질에 매우 만족합니다.',
  },
];

const glassStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
};

export default function LandingTestimonials() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll('.review-card');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => {
            (e.target as HTMLElement).style.cssText += 'opacity:1;transform:translateY(0)';
          }, i * 80);
        }
      }),
      { threshold: 0.1 }
    );
    cards.forEach((card) => {
      (card as HTMLElement).style.cssText = 'opacity:0;transform:translateY(2rem);transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1),transform 0.7s cubic-bezier(0.16,1,0.3,1)';
      observer.observe(card);
    });
    return () => observer.disconnect();
  }, []);

  const Stars = ({ count }: { count: number }) => (
    <div className="flex gap-1 mb-4">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-amber-400 text-sm">
          {/* @ts-ignore */}
          <iconify-icon icon="solar:star-bold" />
        </span>
      ))}
    </div>
  );

  return (
    <section id="reviews" className="py-32" ref={sectionRef} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="review-card mb-16">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">고객 후기</p>
          <h2
            className="font-black text-4xl sm:text-5xl text-white leading-tight"
            style={{ fontFamily: "'Outfit','Pretendard',sans-serif", wordBreak: 'keep-all' }}
          >
            실제 사용자들의<br />솔직한 이야기
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Large review */}
          <div
            className="review-card rounded-3xl p-7 md:row-span-2 flex flex-col justify-between"
            style={glassStyle}
          >
            <div>
              <Stars count={REVIEWS[0].rating} />
              <p className="text-zinc-300 leading-relaxed text-base" style={{ wordBreak: 'keep-all' }}>
                "{REVIEWS[0].text}"
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <img src={REVIEWS[0].avatar} alt="" className="w-10 h-10 rounded-full object-cover" loading="lazy" decoding="async" />
              <div>
                <div className="text-white text-sm font-semibold">{REVIEWS[0].name}</div>
                <div className="text-zinc-500 text-xs">{REVIEWS[0].role}</div>
              </div>
            </div>
          </div>

          {/* Short reviews */}
          {REVIEWS.slice(1).map((review) => (
            <div
              key={review.name}
              className="review-card rounded-3xl p-7"
              style={glassStyle}
            >
              <Stars count={review.rating} />
              <p className="text-zinc-300 leading-relaxed text-sm" style={{ wordBreak: 'keep-all' }}>
                "{review.text}"
              </p>
              <div className="flex items-center gap-3 mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <img src={review.avatar} alt="" className="w-9 h-9 rounded-full object-cover" loading="lazy" decoding="async" />
                <div>
                  <div className="text-white text-sm font-semibold">{review.name}</div>
                  <div className="text-zinc-500 text-xs">{review.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
