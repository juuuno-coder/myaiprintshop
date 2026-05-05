/**
 * 카테고리 통합 관리
 * URL slug와 실제 DB 카테고리명 매핑 + 하위 카테고리 지원
 *
 * dbValues는 Firestore에 저장되는 category 필드 값과 일치해야 함.
 * WowPress 상품의 category는 pathname 첫 번째 세그먼트를 그대로 사용.
 */

export interface SubCategory {
  slug: string;
  label: string;
  dbValue: string;
}

export interface Category {
  slug: string;
  label: string;
  dbValues: string[];
  subcategories?: SubCategory[];
}

export const CATEGORIES: Category[] = [
  {
    slug: 'business-card',
    label: '명함',
    dbValues: ['명함'],
  },
  {
    slug: 'sticker',
    label: '스티커',
    dbValues: ['스티커', '자석제품'],
  },
  {
    slug: 'flyer',
    label: '전단지/리플렛',
    dbValues: ['전단', '홍보물', '디지털인쇄', '서식류', '시스템상품'],
  },
  {
    slug: 'signage',
    label: '사인/배너',
    dbValues: ['사인제품', '부자재'],
  },
  {
    slug: 'goods',
    label: '굿즈/팬시',
    dbValues: [
      '굿즈/다꾸', '판촉물', '팬시제품', '굿즈',
      '포토/액자', '캘린더', '행택/쿠폰/안내장',
      '홀더', '책자', '선거홍보물', '와우기획상품',
      '★비즈하우스 전용제품',
    ],
  },
  {
    slug: 'fashion',
    label: '의류/패션',
    dbValues: ['어패럴', '의류', '패션', '패션/어패럴'],
  },
  {
    slug: 'living',
    label: '홈/리빙',
    dbValues: ['홈/리빙', '리빙', '카페용품'],
  },
  {
    slug: 'tech',
    label: '테크/액세서리',
    dbValues: ['테크', '테크/가전', '폰 액세서리'],
  },
  {
    slug: 'packaging',
    label: '봉투/패키지',
    dbValues: ['봉투', '포장박스', '패키지', '쇼핑백'],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(cat => cat.slug === slug);
}

export function getDbCategories(slug: string): string[] {
  const category = getCategoryBySlug(slug);
  return category ? category.dbValues : [];
}

export function getAllCategories(): Array<{ slug: string; label: string; subcategories?: SubCategory[] }> {
  return CATEGORIES.map(cat => ({
    slug: cat.slug,
    label: cat.label,
    subcategories: cat.subcategories,
  }));
}

export function getSubCategoryDbValue(categorySlug: string, subSlug: string): string | undefined {
  const category = getCategoryBySlug(categorySlug);
  if (!category?.subcategories) return undefined;
  return category.subcategories.find(s => s.slug === subSlug)?.dbValue;
}

export function getCategoryTree(): Category[] {
  return CATEGORIES;
}
