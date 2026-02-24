'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';
import Link from 'next/link';

// 기본 배너 슬라이드 데이터
const defaultBannerSlides = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000',
    title: 'AI 이미지로 만들기 좋은 굿즈',
    subtitle: '크리에이터와 함께! AI 프린트 샵',
    buttonText: 'AI 칩을 더해서 만들기!',
    buttonLink: '/create',
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2000',
    title: '나만의 특별한 패션 아이템',
    subtitle: '티셔츠부터 후드까지, 당신만의 스타일을',
    buttonText: '패션 상품 보기',
    buttonLink: '/shop?category=fashion',
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=2000',
    title: '일상을 특별하게 만드는 굿즈',
    subtitle: '머그컵, 에코백, 스티커까지 다양하게',
    buttonText: '전체 상품 보기',
    buttonLink: '/shop',
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [bannerSlides, setBannerSlides] = useState(defaultBannerSlides);

  // localStorage에서 Hero 슬라이드 설정 로드
  useEffect(() => {
    const loadSlidesFromStorage = () => {
      const savedSlides = localStorage.getItem('hero_slides_config');
      if (savedSlides) {
        try {
          const slides = JSON.parse(savedSlides);
          if (slides && slides.length > 0) {
            setBannerSlides(slides);
          }
        } catch (e) {
          console.error('Failed to parse hero slides:', e);
        }
      }
    };

    loadSlidesFromStorage();

    // 관리자 페이지에서 저장할 때 이벤트 리스너로 갱신
    const handleUpdate = () => {
      loadSlidesFromStorage();
    };

    window.addEventListener('hero_slides_updated', handleUpdate);
    return () => window.removeEventListener('hero_slides_updated', handleUpdate);
  }, []);

  // 자동 슬라이드 (5초마다)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  return (
    <section
      className="relative h-[70vh] lg:h-[80vh] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 슬라이드 이미지 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* 배경 이미지 */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${bannerSlides[currentSlide].imageUrl})`,
            }}
          />

          {/* 오버레이 (가독성 향상) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

          {/* 텍스트 콘텐츠 */}
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-2xl"
              >
                {/* 서브타이틀 */}
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
                  <Wand2 className="w-4 h-4 text-white mr-2" />
                  <span className="text-sm font-medium text-white">
                    {bannerSlides[currentSlide].subtitle}
                  </span>
                </div>

                {/* 메인 타이틀 */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                  {bannerSlides[currentSlide].title}
                </h1>

                {/* CTA 버튼 */}
                <Link
                  href={bannerSlides[currentSlide].buttonLink}
                  className="inline-flex items-center px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  {bannerSlides[currentSlide].buttonText}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 이전/다음 버튼 */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50 transition-all flex items-center justify-center group"
        aria-label="이전 슬라이드"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50 transition-all flex items-center justify-center group"
        aria-label="다음 슬라이드"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* 점(Dot) 네비게이션 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentSlide
                ? 'w-12 h-3 bg-white rounded-full'
                : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/70'
            }`}
            aria-label={`슬라이드 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </section>
  );
}
