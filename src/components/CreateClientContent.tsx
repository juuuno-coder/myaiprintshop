'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, ShoppingBag, ArrowRight, Palette, Layers, Zap } from 'lucide-react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import OrderModal from './common/OrderModal';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  thumbnail: string;
  category: string;
  badge?: string;
}

const AI_STYLES = [
  { id: 'Artistic', name: '예술적', icon: '🎨', desc: '유화/일러스트 스타일' },
  { id: 'Watercolor', name: '수채화', icon: '💧', desc: '부드러운 수채화 느낌' },
  { id: 'Cyberpunk', name: '사이버펑크', icon: '🌃', desc: '네온/미래 감성' },
  { id: 'Minimalist', name: '미니멀', icon: '▫️', desc: '깔끔한 라인 아트' },
  { id: '3D Render', name: '3D 렌더링', icon: '🧊', desc: '입체적인 3D 스타일' },
  { id: 'Pixar Style', name: '디즈니 풍', icon: '🧸', desc: '친근한 캐릭터 스타일' },
];

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
    <>
      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        {/* Abstract Background Accents */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-50/50 to-transparent -z-10" />
        <div className="absolute bottom-0 left-0 w-1/2 h-64 bg-gradient-to-t from-accent-50/50 to-transparent -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-full text-sm font-bold mb-8">
                <Sparkles className="w-4 h-4" />
                사진 1장으로 만드는 프리미엄 브랜드
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black text-gray-900 leading-[1.1] mb-8 tracking-tighter">
                내 사진이 그대로<br />
                <span className="gradient-text">글로벌 굿즈</span>로
              </h1>
              <p className="text-xl text-gray-500 max-w-xl mb-12 font-medium leading-relaxed">
                복잡한 디자인 툴은 잊으세요. 원하는 사진만 올리면<br className="hidden sm:block" />
                현지의 전문 생산 기지에서 프리미엄 굿즈로 재탄생합니다.
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
                  className="px-8 py-5 bg-gray-900 text-white rounded-[20px] font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-xl hover:shadow-gray-200 active:scale-95"
                >
                  <Palette className="w-6 h-6" />
                  {uploadedImage ? '다른 사진으로 변경' : '사진 업로드하여 시작'}
                </button>
                <button 
                  onClick={() => {
                    // Simulate sample upload
                    setIsGenerating(true);
                    setTimeout(() => {
                      setUploadedImage('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000');
                      setIsGenerating(false);
                    }, 1000);
                  }}
                  className="px-8 py-5 bg-white border-2 border-gray-100 text-gray-900 rounded-[20px] font-bold text-lg hover:border-primary-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-5 h-5 text-primary-500" />
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
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-100/30 to-accent-100/30 rounded-[40px] blur-3xl -z-10" />
              <img 
                src="/Users/juuuno/.gemini/antigravity/brain/1f63340d-df41-41e6-b7d1-5cf93368d28b/premium_goodzz_hero_shot_1774576377465.png"
                alt="Premium Goods Showcase"
                className="w-full h-full object-cover rounded-[48px] shadow-2xl border-8 border-white animate-float"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works - Premium Mini Cards */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Palette, title: '디자인 업로드', desc: '사진 한 장이면 충분합니다', color: 'primary' },
              { icon: Zap, title: '실시간 시안 합성', desc: '모든 상품을 1초 만에 확인하세요', color: 'secondary' },
              { icon: ShoppingBag, title: '글로벌 주문 제작', desc: '전 세계 어디든 프리미엄 직배송', color: 'accent' },
            ].map((item, i) => (
              <div key={item.title} className="flex gap-6 items-start">
                <div className={`w-14 h-14 shrink-0 rounded-2xl glass flex items-center justify-center shadow-soft`}>
                  <item.icon className={`w-6 h-6 text-primary-600`} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section (Visible after upload) */}
      <AnimatePresence>
        {uploadedImage && (
          <section className="py-32 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <header className="max-w-3xl mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 leading-tight mb-6 tracking-tight">
                    {isGenerating ? '시안을 생성하고 있어요...' : '방금 올린 사진으로 만든\n오늘의 추천 굿즈 시안'}
                  </h2>
                  <p className="text-lg text-gray-500 font-medium">
                    AI가 사진의 특성을 분석하여 최적의 비율로 각 상품에 자동 합성했습니다.
                  </p>
                </motion.div>
              </header>

              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-32">
                  <div className="relative w-32 h-32 mb-8">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 border-[6px] border-primary-100 border-t-primary-600 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-primary-500 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-xl text-gray-400 font-bold animate-pulse">이미지 분석 및 프리미엄 시안 합성 중...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {[
                    { name: '오버핏 코튼 티셔츠', category: '생활/패션', theme: 'from-blue-50 to-white', rotate: -1 },
                    { name: '세라믹 머그컵 (350ml)', category: '주방/리빙', theme: 'from-green-50 to-white', rotate: 2 },
                    { name: '프리미엄 폰케이스', category: '디지털/액세서리', theme: 'from-purple-50 to-white', rotate: -2 },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className={`premium-card p-2 group overflow-hidden`}
                    >
                      {/* Realistic Mockup Canvas */}
                      <div className={`aspect-[4/5] rounded-[20px] bg-gradient-to-br ${item.theme} mb-4 relative flex items-center justify-center p-8`}>
                        {/* Shadow underneath */}
                        <div className="absolute bottom-10 w-2/3 h-10 bg-black/10 blur-3xl rounded-full" />
                        
                        {/* Mockup Base Icon Placeholder (Improved) */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none scale-150">
                           <ShoppingBag className="w-48 h-48 text-gray-900" />
                        </div>

                        {/* The Mockup Layer */}
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                          style={{ rotate: item.rotate }}
                          className="relative w-full h-full bg-white p-3 shadow-premium rounded-sm border-white"
                        >
                          <img 
                            src={uploadedImage!} 
                            alt={item.name} 
                            className="w-full h-full object-cover mix-blend-multiply opacity-95"
                          />
                          {/* Gloss & Texture Effect Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none shadow-inner" />
                          <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/fabric-plaid.png')]" />
                        </motion.div>
                        
                        {/* Floating Badge */}
                        <div className="absolute top-6 left-6 px-3 py-1 glass rounded-full text-[10px] font-black text-primary-600 tracking-tighter">
                          AUTO-MOCKUP V2
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="text-primary-600 font-black text-xs uppercase tracking-widest block mb-1">{item.category}</span>
                            <h3 className="text-xl font-display font-black text-gray-900">{item.name}</h3>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => {
                              const p = products.find(p => p.name.includes(item.category)) || products[0];
                              setSelectedProduct(p);
                              setIsOrderModalOpen(true);
                            }}
                            className="bg-gray-900 text-white py-4 rounded-[16px] text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95"
                          >
                            바로 주문 <ArrowRight className="w-4 h-4" />
                          </button>
                          <Link 
                            href={`/editor/${(products.find(p => p.name.includes(item.category)) || products[0]).id}?imageUrl=${encodeURIComponent(uploadedImage!)}`}
                            className="bg-white border-2 border-gray-100 text-gray-900 py-4 rounded-[16px] text-sm font-bold hover:border-primary-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            편집하기 <Layers className="w-4 h-4" />
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
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900">어떤 굿즈에 입혀볼까요?</h2>
          <p className="text-gray-500 mt-2">업로드한 사진이 아래 선택한 상품에 자동으로 입혀집니다.</p>
        </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                !selectedCategory
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, i) => (
              <div key={product.id}>
                <motion.div
                  onClick={(e) => handleProductClick(e, product)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      {uploadedImage ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative w-full h-full flex items-center justify-center"
                        >
                          {/* Mockup Base Background (Placeholder icon) */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <ShoppingBag className="w-24 h-24 text-gray-400" />
                          </div>
                          
                          {/* Image placed on the product */}
                          <div className="relative w-3/4 h-3/4 shadow-2xl rounded-sm overflow-hidden border-4 border-white rotate-[-2deg]">
                            <img 
                              src={uploadedImage} 
                              alt="Mockup Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </motion.div>
                      ) : (
                        <div className="w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center shadow-sm">
                          <ShoppingBag className="w-8 h-8 text-primary-500" />
                        </div>
                      )}
                    </div>
                    {/* Hover overlay */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center space-y-2">
                        <button 
                          onClick={(e) => handleProductClick(e, product)}
                          className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1 mx-auto hover:bg-primary-50 transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> 바로 주문
                        </button>
                        <Link 
                          href={`/editor/${product.id}${uploadedImage ? `?imageUrl=${encodeURIComponent(uploadedImage)}` : ''}`}
                          className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1 mx-auto hover:bg-white/30 transition-colors border border-white/30"
                        >
                          <Layers className="w-3.5 h-3.5" /> {uploadedImage ? '편집하기' : '커스텀 시작'}
                        </Link>
                    </div>
                    {product.badge && (
                      <span className={`absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-bold text-white z-10 ${
                        product.badge === 'BEST' ? 'bg-primary-500' :
                        product.badge === 'HOT' ? 'bg-red-500' :
                        product.badge === 'NEW' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}>
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-primary-600 font-medium mb-1">{product.category}</p>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {product.price.toLocaleString()}원~
                    </p>
                  </div>
                </motion.div>
              </div>
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
    </>
  );
}
