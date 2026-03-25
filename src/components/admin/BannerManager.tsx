'use client';

import React, { useState, useEffect } from 'react';
import styles from './AdminComponents.module.css';
import { toast } from 'sonner';
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';

interface HeroSlide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

export default function BannerManager() {
  const [activeTab, setActiveTab] = useState<'hero' | 'popup'>('hero');

  // Popup Banner State
  const [isPopupEnabled, setIsPopupEnabled] = useState(true);
  const [bannerTitle, setBannerTitle] = useState('AI 디자인 OPEN 이벤트');
  const [imagePath, setImagePath] = useState('/banner-ai-event.png');
  const [linkUrl, setLinkUrl] = useState('/shop');

  // Hero Slides State
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([
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
  ]);

  // Load configuration from localStorage
  useEffect(() => {
    // Load popup config
    const savedPopupConfig = localStorage.getItem('global_popup_config');
    if (savedPopupConfig) {
      try {
        const config = JSON.parse(savedPopupConfig);
        setIsPopupEnabled(config.isEnabled ?? true);
        setBannerTitle(config.title || bannerTitle);
        setImagePath(config.imagePath || imagePath);
        setLinkUrl(config.linkUrl || linkUrl);
      } catch (e) {
        console.error('Failed to parse popup config', e);
      }
    }

    // Load hero slides config
    const savedHeroSlides = localStorage.getItem('hero_slides_config');
    if (savedHeroSlides) {
      try {
        const slides = JSON.parse(savedHeroSlides);
        setHeroSlides(slides);
      } catch (e) {
        console.error('Failed to parse hero slides config', e);
      }
    }
  }, []);

  const handleSavePopup = () => {
    const config = {
      isEnabled: isPopupEnabled,
      title: bannerTitle,
      imagePath: imagePath,
      linkUrl: linkUrl,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('global_popup_config', JSON.stringify(config));
    window.dispatchEvent(new Event('popup_config_updated'));
    toast.success('팝업 설정이 저장되었습니다.');
  };

  const handleSaveHeroSlides = () => {
    localStorage.setItem('hero_slides_config', JSON.stringify(heroSlides));
    window.dispatchEvent(new Event('hero_slides_updated'));
    toast.success('Hero 배너가 저장되었습니다. 페이지를 새로고침하면 적용됩니다.');
  };

  const updateHeroSlide = (id: number, field: keyof HeroSlide, value: string) => {
    setHeroSlides(slides =>
      slides.map(slide =>
        slide.id === id ? { ...slide, [field]: value } : slide
      )
    );
  };

  const addHeroSlide = () => {
    const newId = Math.max(...heroSlides.map(s => s.id), 0) + 1;
    setHeroSlides([
      ...heroSlides,
      {
        id: newId,
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000',
        title: '새로운 배너',
        subtitle: '서브타이틀을 입력하세요',
        buttonText: '버튼 텍스트',
        buttonLink: '/shop',
      },
    ]);
  };

  const deleteHeroSlide = (id: number) => {
    if (heroSlides.length <= 1) {
      toast.error('최소 1개의 슬라이드는 필요합니다.');
      return;
    }
    setHeroSlides(slides => slides.filter(slide => slide.id !== id));
    toast.success('슬라이드가 삭제되었습니다.');
  };

  const moveSlide = (id: number, direction: 'up' | 'down') => {
    const index = heroSlides.findIndex(s => s.id === id);
    if (direction === 'up' && index > 0) {
      const newSlides = [...heroSlides];
      [newSlides[index], newSlides[index - 1]] = [newSlides[index - 1], newSlides[index]];
      setHeroSlides(newSlides);
    } else if (direction === 'down' && index < heroSlides.length - 1) {
      const newSlides = [...heroSlides];
      [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
      setHeroSlides(newSlides);
    }
  };

  return (
    <div className={styles.componentContainer}>
      <h2 className={styles.title}>팝업 & 배너 관리</h2>
      <p className={styles.desc}>홈페이지 메인에 표시될 배너를 관리합니다.</p>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveTab('hero')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'hero' ? '3px solid #10b981' : '3px solid transparent',
            fontWeight: activeTab === 'hero' ? 'bold' : 'normal',
            color: activeTab === 'hero' ? '#10b981' : '#6b7280',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Hero 배너 (메인 슬라이드)
        </button>
        <button
          onClick={() => setActiveTab('popup')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'popup' ? '3px solid #10b981' : '3px solid transparent',
            fontWeight: activeTab === 'popup' ? 'bold' : 'normal',
            color: activeTab === 'popup' ? '#10b981' : '#6b7280',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          팝업 배너
        </button>
      </div>

      {/* Hero 배너 관리 */}
      {activeTab === 'hero' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              총 {heroSlides.length}개의 슬라이드 • 자동 회전: 5초
            </p>
            <button
              onClick={addHeroSlide}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              <Plus size={16} /> 슬라이드 추가
            </button>
          </div>

          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 'bold', fontSize: '1rem' }}>슬라이드 #{index + 1}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => moveSlide(slide.id, 'up')}
                    disabled={index === 0}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: index === 0 ? '#e5e7eb' : '#f3f4f6',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: index === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => moveSlide(slide.id, 'down')}
                    disabled={index === heroSlides.length - 1}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: index === heroSlides.length - 1 ? '#e5e7eb' : '#f3f4f6',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: index === heroSlides.length - 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={() => deleteHeroSlide(slide.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>배경 이미지 URL</label>
                <input
                  type="text"
                  value={slide.imageUrl}
                  onChange={(e) => updateHeroSlide(slide.id, 'imageUrl', e.target.value)}
                  className={styles.input}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>메인 타이틀</label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => updateHeroSlide(slide.id, 'title', e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>서브타이틀</label>
                  <input
                    type="text"
                    value={slide.subtitle}
                    onChange={(e) => updateHeroSlide(slide.id, 'subtitle', e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>버튼 텍스트</label>
                  <input
                    type="text"
                    value={slide.buttonText}
                    onChange={(e) => updateHeroSlide(slide.id, 'buttonText', e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>버튼 링크</label>
                  <input
                    type="text"
                    value={slide.buttonLink}
                    onChange={(e) => updateHeroSlide(slide.id, 'buttonLink', e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              {/* 미리보기 */}
              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>미리보기</label>
                <div
                  style={{
                    height: '150px',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundImage: `url(${slide.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3))' }}>
                    <div style={{ padding: '1rem', color: 'white' }}>
                      <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem', opacity: 0.9 }}>{slide.subtitle}</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{slide.title}</div>
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '0.5rem 1rem',
                          background: '#10b981',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                        }}
                      >
                        {slide.buttonText}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            className={styles.saveBtn}
            onClick={handleSaveHeroSlides}
            style={{ marginTop: '1.5rem' }}
          >
            Hero 배너 저장하기
          </button>
        </div>
      )}

      {/* 팝업 배너 관리 */}
      {activeTab === 'popup' && (
        <div className={styles.settingSection}>
          <div className={styles.toggleRow}>
            <h3>메인 팝업 활성화</h3>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={isPopupEnabled}
                onChange={(e) => setIsPopupEnabled(e.target.checked)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>배너 제목 (내부용)</label>
            <input
              type="text"
              value={bannerTitle}
              onChange={(e) => setBannerTitle(e.target.value)}
              className={styles.input}
              placeholder="예: 신년 이벤트"
            />
          </div>

          <div className={styles.formGroup}>
            <label>이미지 경로</label>
            <input
              type="text"
              value={imagePath}
              onChange={(e) => setImagePath(e.target.value)}
              className={styles.input}
              placeholder="/popup-image.png"
            />
          </div>

          <div className={styles.formGroup}>
            <label>클릭 시 이동 URL</label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className={styles.input}
              placeholder="/shop 또는 https://example.com"
            />
          </div>

          <div className={styles.previewSection}>
            <label>미리보기</label>
            <div className={styles.bannerPreview}>
              {imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePath}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x250?text=No+Image';
                  }}
                />
              ) : (
                <span style={{ color: '#999', fontSize: '12px' }}>이미지 없음</span>
              )}
              {!isPopupEnabled && <div className={styles.disabledOverlay}>OFF</div>}
            </div>
          </div>

          <button className={styles.saveBtn} onClick={handleSavePopup}>
            팝업 설정 저장하기
          </button>
        </div>
      )}
    </div>
  );
}
