
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // For discount display
  thumbnail: string;
  category: string;
  badge?: string; // e.g., 'BEST', 'NEW'
  reviewCount: number;
  rating: number;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: '프리미엄 코튼 오버핏 반팔티',
    price: 18900,
    originalPrice: 25000,
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
    category: '의류',
    badge: 'BEST',
    reviewCount: 128,
    rating: 4.8,
  },
  {
    id: 'p2',
    name: '베이직 머그컵 (11oz)',
    price: 8900,
    thumbnail: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800',
    category: '홈/리빙',
    reviewCount: 85,
    rating: 4.7,
  },
  {
    id: 'p3',
    name: '캔버스 에코백',
    price: 12500,
    originalPrice: 15000,
    thumbnail: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&q=80&w=800',
    category: '잡화',
    badge: 'NEW',
    reviewCount: 12,
    rating: 4.9,
  },
  {
    id: 'p4',
    name: '아이폰 15 하드 케이스',
    price: 15000,
    thumbnail: 'https://images.unsplash.com/photo-1586232702178-f044c5f4d4b7?auto=format&fit=crop&q=80&w=800',
    category: '테크',
    reviewCount: 243,
    rating: 4.6,
  },
  {
    id: 'p5',
    name: '후드 집업 (기모 안감)',
    price: 32000,
    originalPrice: 45000,
    thumbnail: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
    category: '의류',
    badge: 'HOT',
    reviewCount: 310,
    rating: 4.9,
  },
  {
    id: 'p6',
    name: '메탈 핀 버튼 세트',
    price: 5000,
    thumbnail: 'https://images.unsplash.com/photo-1623190638510-188b307ec3c5?auto=format&fit=crop&q=80&w=800',
    category: '굿즈',
    reviewCount: 45,
    rating: 4.5,
  },
  { id: 'p7', name: '맨투맨', price: 45210, thumbnail: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2', category: '의류', reviewCount: 10, rating: 5 },
  { id: 'p8', name: '반팔 티셔츠', price: 15840, thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', category: '의류', reviewCount: 15, rating: 4.5 },
  { id: 'p9', name: '에코백 (프린팅)', price: 18000, thumbnail: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1', category: '잡화', badge: 'BEST', reviewCount: 100, rating: 4.8 },
  { id: 'p10', name: '투명 클립펜', price: 5280, thumbnail: 'https://images.unsplash.com/photo-1585336139118-89c15332b6dd', category: '문구', reviewCount: 50, rating: 4.7 },
  { id: 'p11', name: '차량용 자석 스티커', price: 11440, thumbnail: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0', category: '스티커', reviewCount: 20, rating: 4.5 },
  { id: 'p12', name: '투명 포토카드', price: 15730, thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', category: '굿즈', reviewCount: 30, rating: 4.9 },
  { id: 'p13', name: '자유 모양 보드', price: 41140, thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38', category: '인테리어', reviewCount: 5, rating: 4.0 },
  { id: 'p14', name: 'LED 라이트 배너', price: 44000, thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853', category: '광고', badge: 'HOT', reviewCount: 8, rating: 4.2 },
  { id: 'p15', name: 'AI 레시피 전자책', price: 9900, thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c', category: '레시피', reviewCount: 200, rating: 4.9 },
  { id: 'p16', name: '에코백 (프린팅)', price: 18000, thumbnail: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1', category: '패션', reviewCount: 120, rating: 4.8 },
  { id: 'p17', name: '캔버스 액자', price: 21550, thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5', category: '인테리어', reviewCount: 40, rating: 4.7 },
  { id: 'p18', name: '무선책자', price: 25000, thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f', category: '인쇄', reviewCount: 15, rating: 4.5 },
  { id: 'p19', name: '사원증', price: 3300, thumbnail: 'https://images.unsplash.com/photo-1590402444681-cd18385a1c10', category: '인쇄', reviewCount: 60, rating: 4.6 },
  { id: 'p20', name: '폴라로이드팩', price: 8800, thumbnail: 'https://images.unsplash.com/photo-1526285033450-058ec351ea6a', category: '굿즈', reviewCount: 90, rating: 4.9 }
];
