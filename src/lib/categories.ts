/**
 * 카테고리 통합 관리
 * URL slug와 실제 DB 카테고리명 매핑 + 하위 카테고리 지원
 */

export interface SubCategory {
  slug: string; // 하위 카테고리 URL slug
  label: string; // UI에 표시되는 한글 레이블
  dbValue: string; // Firestore에 저장되는 실제 카테고리명
}

export interface Category {
  slug: string; // URL에 사용되는 영문 slug
  label: string; // UI에 표시되는 한글 레이블
  dbValues: string[]; // Firestore에 저장된 실제 카테고리명 (복수 가능)
  subcategories?: SubCategory[]; // 하위 카테고리 (선택사항)
}

export const CATEGORIES: Category[] = [
  {
    slug: 'print',
    label: '인쇄',
    dbValues: ['인쇄'],
    subcategories: [
      { slug: 'business-card', label: '명함', dbValue: '명함' },
      { slug: 'sticker', label: '스티커', dbValue: '스티커' },
      { slug: 'banner', label: '현수막/배너', dbValue: '현수막' },
      { slug: 'poster', label: '포스터', dbValue: '포스터' },
      { slug: 'leaflet', label: '리플렛/팜플렛', dbValue: '리플렛' },
      { slug: 'promotion', label: '홍보물/기타', dbValue: '홍보물' },
      { slug: 'booklet', label: '책자', dbValue: '책자' },
      { slug: 'postcard', label: '엽서/메세지카드', dbValue: '엽서' },
      { slug: 'photocard', label: '포토카드', dbValue: '포토카드' },
      { slug: 'envelope', label: '봉투', dbValue: '봉투' },
      { slug: 'id-card', label: '사원증', dbValue: '사원증' },
    ]
  },
  {
    slug: 'goods',
    label: '굿즈/팬시',
    dbValues: ['굿즈', '잡화', '문구'],
    subcategories: [
      { slug: 'stationery', label: '문구', dbValue: '문구' },
      { slug: 'goods-items', label: '굿즈', dbValue: '굿즈' },
      { slug: 'fancy', label: '팬시', dbValue: '팬시' },
    ]
  },
  {
    slug: 'fashion',
    label: '패션/어패럴',
    dbValues: ['의류', '패션'],
    subcategories: [
      { slug: 'tshirt', label: '티셔츠', dbValue: '티셔츠' },
      { slug: 'hoodie', label: '후드/후드집업', dbValue: '후드' },
      { slug: 'ecobag', label: '에코백', dbValue: '에코백' },
    ]
  },
  {
    slug: 'store',
    label: '우리가게',
    dbValues: ['가게', '매장'],
    subcategories: [
      { slug: 'sign', label: '사인제품', dbValue: '사인' },
      { slug: 'signature', label: '시그니처', dbValue: '시그니처' },
      { slug: 'cafe', label: '카페용품', dbValue: '카페용품' },
    ]
  },
  {
    slug: 'custom',
    label: '주문제작',
    dbValues: ['주문제작']
  },
  {
    slug: 'recipe',
    label: 'AI 레시피',
    dbValues: ['레시피']
  }
];

// Slug로 카테고리 찾기
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(cat => cat.slug === slug);
}

// Slug로 DB 카테고리명 배열 가져오기
export function getDbCategories(slug: string): string[] {
  const category = getCategoryBySlug(slug);
  return category ? category.dbValues : [];
}

// 모든 카테고리의 slug와 label 가져오기 (네비게이션용)
export function getAllCategories(): Array<{ slug: string; label: string; subcategories?: SubCategory[] }> {
  return CATEGORIES.map(cat => ({
    slug: cat.slug,
    label: cat.label,
    subcategories: cat.subcategories
  }));
}

// 서브카테고리 slug로 DB 값 찾기
export function getSubCategoryDbValue(categorySlug: string, subSlug: string): string | undefined {
  const category = getCategoryBySlug(categorySlug);
  if (!category || !category.subcategories) return undefined;

  const sub = category.subcategories.find(s => s.slug === subSlug);
  return sub?.dbValue;
}

// 모든 서브카테고리 포함한 카테고리 트리 가져오기
export function getCategoryTree(): Category[] {
  return CATEGORIES;
}
