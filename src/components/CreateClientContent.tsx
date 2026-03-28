'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import OrderModal from './common/OrderModal';

interface Product {
  id: string;
  name: string;
  price: number;
  thumbnail: string;
  category: string;
  badge?: string;
}

const glassStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(12px)',
};

export default function CreateClientContent({ products }: { products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsGenerating(true);
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      
      // Simulate high-quality drafting process
      setTimeout(() => {
        setIsGenerating(false);
      }, 1500);
    }
  };

  const handleProductClick = (e: React.MouseEvent, product: Product) => {
    if (uploadedImage) {
      e.preventDefault();
      setSelectedProduct(product);
      setIsOrderModalOpen(true);
    }
  };

  const categories = [...new Set(products.map(p => p.category))];
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  return (
    <div className="min-h-[100dvh]">
      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background Accents */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-amber-500/5 blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-1/2 h-64 bg-amber-500/5 blur-[120px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-8 uppercase tracking-widest text-amber-400"
                style={{ ...glassStyle, borderRadius: 999 }}
              >
                {/* @ts-ignore */}
                <iconify-icon icon="solar:magic-stick-3-bold" />
                사진 1장으로 기획 끝
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tighter" style={{ wordBreak: 'keep-all' }}>
                내 사진이 그대로<br />
                <span className="text-amber-500">글로벌 굿즈로.</span>
              </h1>
              <p className="text-lg text-zinc-400 max-w-xl mb-12 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                복잡한 디자인 툴은 잊으세요. 원하는 사진만 올리면 AI가
                최적의 시안을 제안하고, 전문 생산 기지에서 프리미엄 굿즈로 제작합니다.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/jpeg, image/png, image/webp"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-5 bg-amber-500 text-zinc-950 rounded-[20px] font-bold text-lg flex items-center justify-center gap-3 hover:bg-amber-400 transition-all shadow-xl active:scale-[0.98]"
                >
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:gallery-add-bold" class="text-2xl" />
                  {uploadedImage ? '다른 사진으로 변경' : '사진 업로드하여 시작'}
                </button>
                <button 
                  onClick={() => {
                    setIsGenerating(true);
                    setTimeout(() => {
                      setUploadedImage('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000');
                      setIsGenerating(false);
                    }, 1000);
                  }}
                  className="px-8 py-5 text-white rounded-[20px] font-bold text-lg hover:bg-white/5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  style={glassStyle}
                >
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:wand-magic-bold" class="text-amber-500 text-xl" />
                  샘플로 미리보기
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative aspect-square"
            >
              <div className="absolute inset-0 bg-amber-500/20 rounded-[40px] blur-3xl -z-10" />
              <img 
                src="/premium_goodzz_hero_shot_1774576377465.png"
                alt="Premium Goods Showcase"
                className="w-full h-full object-cover rounded-[48px] shadow-2xl border border-white/10 animate-[float_6s_ease-in-out_infinite]"
                onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/create-hero/800/800" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works - Dark Bento Mini Cards */}
      <section className="py-24" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: 'solar:gallery-bold', title: '디자인 업로드', desc: '사진 한 장이면 충분합니다' },
              { icon: 'solar:flashlight-bold', title: '실시간 시안 합성', desc: '모든 상품을 1초 만에 확인하세요' },
              { icon: 'solar:box-minimalistic-bold', title: '글로벌 주문 제작', desc: '전 세계 어디든 프리미엄 직배송' },
            ].map((item, i) => (
              <div key={item.title} className="flex flex-col gap-4 p-8 rounded-3xl" style={glassStyle}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  {/* @ts-ignore */}
                  <iconify-icon icon={item.icon} class="text-2xl text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-zinc-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section (Visible after upload) */}
      <AnimatePresence>
        {uploadedImage && (
          <section className="py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <header className="max-w-3xl mb-16 text-center mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-amber-500 text-sm font-bold uppercase tracking-widest mb-4">자동 시안 제안</p>
                  <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6 tracking-tight" style={{ wordBreak: 'keep-all' }}>
                    {isGenerating ? '시안을 생성하고 있어요...' : '방금 올린 사진으로 만든\n오늘의 추천 굿즈'}
                  </h2>
                </motion.div>
              </header>

              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="relative w-24 h-24 mb-6">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 border-[4px] border-zinc-800 border-t-amber-500 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* @ts-ignore */}
                      <iconify-icon icon="solar:magic-stick-3-bold" class="text-3xl text-amber-500 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-lg text-zinc-400 font-bold animate-pulse">이미지 분석 및 프리미엄 시안 합성 중...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: '오버핏 코튼 티셔츠', category: '패션', bg: 'bg-zinc-800', rotate: -1 },
                    { name: '세라믹 머그컵', category: '리빙', bg: 'bg-zinc-900', rotate: 2 },
                    { name: '프리미엄 폰케이스', category: '액세서리', bg: 'bg-zinc-800', rotate: -2 },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className={`p-3 rounded-3xl group overflow-hidden`}
                      style={glassStyle}
                    >
                      {/* Realistic Mockup Canvas */}
                      <div className={`aspect-[4/5] rounded-[20px] ${item.bg} mb-4 relative flex items-center justify-center p-8 overflow-hidden`}>
                        {/* Shadow underneath */}
                        <div className="absolute bottom-10 w-2/3 h-10 bg-black/40 blur-2xl rounded-full" />
                        
                        {/* The Mockup Layer */}
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                          style={{ rotate: item.rotate }}
                          className="relative w-full h-full bg-zinc-950 p-3 shadow-2xl rounded-md border border-white/5"
                        >
                          <img 
                            src={uploadedImage!} 
                            alt={item.name} 
                            className="w-full h-full object-cover opacity-90"
                          />
                          {/* Gloss & Texture Effect Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                        </motion.div>
                        
                        {/* Floating Badge */}
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black text-amber-500 tracking-tighter" style={{ background: 'rgba(9,9,11,0.6)', backdropFilter: 'blur(8px)' }}>
                          AUTO-MOCKUP
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="mb-6">
                          <span className="text-amber-500 font-bold text-xs uppercase tracking-widest block mb-1">{item.category}</span>
                          <h3 className="text-xl font-bold text-white leading-tight">{item.name}</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => {
                              const p = products.find(p => p.name.includes(item.category)) || products[0];
                              setSelectedProduct(p);
                              setIsOrderModalOpen(true);
                            }}
                            className="bg-amber-500 text-zinc-950 py-3.5 rounded-[12px] text-sm font-bold flex items-center justify-center gap-2 hover:bg-amber-400 transition-all"
                          >
                            바로 주문
                          </button>
                          <Link 
                            href={`/editor/${(products.find(p => p.name.includes(item.category)) || products[0]).id}?imageUrl=${encodeURIComponent(uploadedImage!)}`}
                            className="text-white py-3.5 rounded-[12px] text-sm font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                          >
                            편집하기 
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* Product Selector */}
      <section className="py-24" style={{ borderTop: uploadedImage ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black text-white mb-4">어떤 굿즈에 입혀볼까요?</h2>
            <p className="text-zinc-400 text-lg">원하는 상품을 선택하고 사진을 적용해보세요.</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                !selectedCategory
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              전체
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-zinc-950'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mini Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                onClick={(e) => handleProductClick(e, product)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 8) * 0.05 }}
                className="group cursor-pointer rounded-3xl p-3 relative overflow-hidden transition-all hover:-translate-y-1"
                style={glassStyle}
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-800 mb-4 flex items-center justify-center p-6">
                  {uploadedImage ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative w-full h-full flex items-center justify-center"
                    >
                      <img 
                        src={uploadedImage} 
                        alt="Mockup Preview" 
                        className="w-3/4 h-3/4 object-cover shadow-2xl rounded-md border border-white/10 rotate-[-2deg]"
                      />
                    </motion.div>
                  ) : (
                    <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover rounded-xl opacity-80 mix-blend-screen grayscale group-hover:grayscale-0 transition-all duration-500" />
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                    <button 
                      onClick={(e) => handleProductClick(e, product)}
                      className="bg-amber-500 text-zinc-950 px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform"
                    >
                      바로 주문
                    </button>
                    <Link 
                      href={`/editor/${product.id}${uploadedImage ? `?imageUrl=${encodeURIComponent(uploadedImage)}` : ''}`}
                      className="text-white px-5 py-2.5 rounded-full font-bold text-sm border border-white/20 hover:bg-white/10 transition-colors"
                    >
                      {uploadedImage ? '편집하기' : '커스텀 시작'}
                    </Link>
                  </div>
                </div>

                <div className="px-2 pb-1">
                  <p className="text-xs text-amber-500 font-bold mb-1">{product.category}</p>
                  <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-lg font-black text-white mt-1" style={{ fontFamily: "'Outfit',sans-serif" }}>
                    {product.price.toLocaleString()}원~
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {selectedProduct && uploadedImage && (
        <OrderModal 
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          product={selectedProduct}
          customDesignUrl={uploadedImage}
        />
      )}
    </div>
  );
}
