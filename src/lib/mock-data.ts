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
    thumbnail: '/images/products/tshirt.png',
    category: '의류',
    badge: 'BEST',
    reviewCount: 128,
    rating: 4.8,
  },
  {
    id: 'p2',
    name: '베이직 머그컵 (11oz)',
    price: 8900,
    thumbnail: '/images/products/mug.png',
    category: '홈/리빙',
    reviewCount: 85,
    rating: 4.7,
  },
  {
    id: 'p3',
    name: '캔버스 에코백',
    price: 12500,
    originalPrice: 15000,
    thumbnail: '/images/products/ecobag.png',
    category: '잡화',
    badge: 'NEW',
    reviewCount: 12,
    rating: 4.9,
  },
  {
    id: 'p4',
    name: '아이폰 투명 젤리 케이스',
    price: 15000,
    thumbnail: '/images/products/phonecase.png',
    category: '테크',
    reviewCount: 243,
    rating: 4.6,
  },
  {
    id: 'p5',
    name: '베이직 기모 후드티',
    price: 32000,
    originalPrice: 45000,
    thumbnail: '/images/products/hoodie.png',
    category: '의류',
    badge: 'HOT',
    reviewCount: 310,
    rating: 4.9,
  },
  {
    id: 'p6',
    name: '메탈 핀 버튼 세트',
    price: 5000,
    thumbnail: '/images/products/pins.png',
    category: '굿즈',
    reviewCount: 45,
    rating: 4.5,
  },
  { 
    id: 'p7', 
    name: '오가닉 코튼 맨투맨', 
    price: 45210, 
    thumbnail: '/images/products/sweatshirt.png',
    category: '의류', 
    reviewCount: 10, 
    rating: 5 
  },
  { 
    id: 'p8', 
    name: '포켓 반팔 티셔츠', 
    price: 15840, 
    thumbnail: '/images/products/pockettshirt.png',
    category: '의류', 
    reviewCount: 15, 
    rating: 4.5 
  },
  { 
    id: 'p9', 
    name: '데이리 투톤 에코백', 
    price: 18000, 
    thumbnail: '/images/products/twotone_ecobag.png',
    category: '잡화', 
    badge: 'BEST', 
    reviewCount: 100, 
    rating: 4.8 
  },
  { 
    id: 'p10', 
    name: '프리미엄 무선 노트', 
    price: 5280, 
    thumbnail: '/images/products/notebook.png',
    category: '문구', 
    reviewCount: 50, 
    rating: 4.7 
  },
  { 
    id: 'p11', 
    name: '다이컷 데코 스티커', 
    price: 11440, 
    thumbnail: '/images/products/stickers.png', 
    category: '스티커', 
    reviewCount: 20, 
    rating: 4.5 
  },
  { 
    id: 'p12', 
    name: '렌티큘러 포토카드', 
    price: 15730, 
    thumbnail: '/images/products/photocards.png',
    category: '굿즈', 
    reviewCount: 30, 
    rating: 4.9 
  },
  { 
    id: 'p13', 
    name: '아크릴 등신대/스탠드', 
    price: 41140, 
    thumbnail: '/images/products/acrylicstand.png',
    category: '인테리어', 
    reviewCount: 5, 
    rating: 4.0 
  },
  { 
    id: 'p14', 
    name: '레트로 컬러 머그', 
    price: 12000, 
    thumbnail: '/images/products/retromug.png', 
    category: '홈/리빙', 
    badge: 'HOT', 
    reviewCount: 8, 
    rating: 4.2 
  },
  { 
    id: 'p15', 
    name: '무광 하드 케이스', 
    price: 18000, 
    thumbnail: '/images/products/mattecase.png',
    category: '테크', 
    reviewCount: 200, 
    rating: 4.9 
  },
  { 
    id: 'p16', 
    name: '투명 리유저블 텀블러', 
    price: 14000, 
    thumbnail: '/images/products/tumbler.png',
    category: '홈/리빙', 
    reviewCount: 120, 
    rating: 4.8 
  },
  { 
    id: 'p17', 
    name: '타포린 쇼퍼백', 
    price: 21550, 
    thumbnail: '/images/products/shopperbag.png',
    category: '패션', 
    reviewCount: 40, 
    rating: 4.7 
  },
  { 
    id: 'p18', 
    name: '하드커버 바인더', 
    price: 25000, 
    thumbnail: '/images/products/binder.png',
    category: '인쇄', 
    reviewCount: 15, 
    rating: 4.5 
  },
  { 
    id: 'p19', 
    name: '프리미엄 무광 명함', 
    price: 9900, 
    thumbnail: '/images/products/businesscards.png',
    category: '인쇄', 
    reviewCount: 60, 
    rating: 4.6 
  },
  { 
    id: 'p20', 
    name: '마스킹 테이프', 
    price: 8800, 
    thumbnail: '/images/products/maskingtape.png',
    category: '스티커', 
    reviewCount: 90, 
    rating: 4.9 
  },
  { 
    id: 'p21', 
    name: '비즈니스 전단지 (A4)', 
    price: 35000, 
    thumbnail: '/images/products/flyer.png', 
    category: '전단지', 
    reviewCount: 40, 
    rating: 4.8 
  },
  { 
    id: 'p22', 
    name: '3단 홍보 리플렛', 
    price: 45000, 
    thumbnail: '/images/products/leaflet.png', 
    category: '리플렛', 
    reviewCount: 25, 
    rating: 4.7 
  },
  { 
    id: 'p23', 
    name: '프리미엄 포장박스', 
    price: 1200, 
    thumbnail: '/images/products/box.png', 
    category: '포장박스', 
    reviewCount: 150, 
    rating: 4.9 
  },
  { 
    id: 'p24', 
    name: '럭셔리 종이 쇼핑백', 
    price: 800, 
    thumbnail: '/images/products/paperbag.png', 
    category: '쇼핑백', 
    reviewCount: 200, 
    rating: 4.9 
  }
];
