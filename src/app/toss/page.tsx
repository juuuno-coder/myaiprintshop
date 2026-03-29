import Link from 'next/link';

export default function TossHomePage() {
  return (
    <div className="flex flex-1 flex-col px-5 py-8">
      {/* 히어로 */}
      <div className="mb-10 mt-4">
        <h1 className="mb-3 text-[26px] font-bold leading-tight text-gray-900">
          세상의 모든 굿즈를<br />
          한곳에서
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-500">
          크리에이터의 굿즈를 탐색하고<br />
          마음에 드는 아이템을 만나보세요
        </p>
      </div>

      {/* 기능 카드 */}
      <div className="mb-8 space-y-3">
        <Link
          href="/toss/shop"
          className="flex items-center gap-4 rounded-2xl bg-gray-50 p-5 transition-colors active:bg-gray-100"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500 text-white text-lg">
            🛍️
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-gray-900">굿즈 쇼핑</p>
            <p className="mt-0.5 text-[13px] text-gray-500">
              인기 굿즈를 둘러보세요
            </p>
          </div>
          <span className="text-gray-300">›</span>
        </Link>
      </div>

      {/* CTA */}
      <div className="mt-auto pb-4">
        <Link
          href="/toss/shop"
          className="flex w-full items-center justify-center rounded-xl bg-purple-500 py-4 text-[16px] font-semibold text-white transition-colors active:bg-purple-600"
        >
          시작하기
        </Link>
      </div>
    </div>
  );
}
