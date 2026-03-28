'use client';

const BRANDS = [
  '스텔라랩스', '베리파이코리아', '루미너스', '클라우드파스',
  '위브스튜디오', '넥타르샵', '그레이풋', '아톰미디어',
];

export default function LandingTrustStrip() {
  const doubled = [...BRANDS, ...BRANDS];

  return (
    <div
      className="py-12 overflow-hidden"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <p className="text-center text-xs text-zinc-600 uppercase tracking-widest mb-6">믿고 사용하는 고객사</p>
      <div className="relative">
        <div
          className="flex gap-16 items-center whitespace-nowrap"
          style={{
            animation: 'marquee 30s linear infinite',
            width: 'max-content',
          }}
        >
          {doubled.map((brand, i) => (
            <span key={i} className="text-zinc-600 font-semibold text-sm">{brand}</span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
