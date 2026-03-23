import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import HomeClientContent from '@/components/HomeClientContent';
import ReviewsSection from '@/components/ReviewsSection';
import Link from 'next/link';
import { getLatestReviews } from '@/lib/reviews';
import { Zap, Sparkles, Shield, Truck, Printer, Star, Shirt, Store, Palette, BookOpen } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  category: string;
  badge?: string;
  reviewCount: number;
  rating: number;
}

// 카테고리 — Lucide 아이콘 사용
const categories = [
  { name: '인쇄', href: '/shop?category=print', icon: Printer },
  { name: '굿즈/팬시', href: '/shop?category=goods', icon: Star },
  { name: '패션/어패럴', href: '/shop?category=fashion', icon: Shirt },
  { name: '우리가게', href: '/shop?category=store', icon: Store },
  { name: '주문제작', href: '/shop?category=custom', icon: Palette },
  { name: 'AI 레시피', href: '/shop?category=recipe', icon: BookOpen },
];

async function getHomeProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3300';

  try {
    const [aiGoodsRes, bestRes] = await Promise.all([
      fetch(`${baseUrl}/api/products?type=new&limit=8`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/products?type=best&limit=8`, { cache: 'no-store' }),
    ]);

    const [aiGoodsData, bestData] = await Promise.all([
      aiGoodsRes.json(),
      bestRes.json(),
    ]);

    return {
      aiGoodsItems: aiGoodsData.success ? aiGoodsData.products : [],
      bestProducts: bestData.success ? bestData.products : [],
    };
  } catch (error) {
    console.error('Failed to fetch home products:', error);
    return {
      aiGoodsItems: [],
      bestProducts: [],
    };
  }
}

export default async function Home() {
  const { aiGoodsItems, bestProducts } = await getHomeProducts();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: 'AI 디자인', desc: '몇 초만에 프로페셔널한\n디자인 완성' },
              { icon: Sparkles, title: '프리미엄 품질', desc: '최고급 소재와\n정교한 프린팅' },
              { icon: Truck, title: '빠른 배송', desc: '24시간 이내 제작,\n빠른 배송' },
              { icon: Shield, title: '환불 보장', desc: '100% 만족 보장,\n무료 환불' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">
                  {desc.split('\n').map((line, i) => (
                    <span key={i}>{line}{i === 0 && <br />}</span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center">
            카테고리
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="card card-hover p-6 text-center group"
                >
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-100 transition-colors">
                    <Icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 제품 섹션 */}
      <HomeClientContent
        aiGoodsItems={aiGoodsItems}
        bestProducts={bestProducts}
      />

      {/* 리뷰 섹션 (하나만) */}
      <ReviewsSection />

      <Footer />
    </main>
  );
}
