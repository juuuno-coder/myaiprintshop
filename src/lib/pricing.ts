import { Product, PricingOptionGroup } from './products';

export interface SelectedOptions {
  [groupId: string]: string; // valueId
}

/**
 * 선택된 옵션들에 따라 최종 가격을 계산합니다.
 * 공식: (기본가 + 추가금액합산) * 가중치합산(또는 곱)
 */
export function calculateProductPrice(
  product: Product,
  selectedOptions: SelectedOptions,
  quantity: number = 1
): number {
  const { price: basePrice, options, volumePricing } = product;
  const groups = options?.groups;

  if (!groups || groups.length === 0) {
    // 상품 기본 옵션이 없는 경우에도 수량 할인은 적용 가능
    const discountedBase = applyVolumeDiscount(basePrice, quantity, volumePricing);
    return Math.round(discountedBase);
  }

  let totalPrice = basePrice;
  let multiplier = 1;

  groups.forEach((group) => {
    const selectedValueId = selectedOptions[group.id];
    if (!selectedValueId) return;

    const value = group.values.find((v) => v.id === selectedValueId);
    if (!value) return;

    if (value.priceAdded) {
      totalPrice += value.priceAdded;
    }

    if (value.priceMultiplier) {
      multiplier *= value.priceMultiplier;
    }
  });

  const finalUnitPrice = totalPrice * multiplier;
  
  // 수량 할인 적용
  const discountedPrice = applyVolumeDiscount(finalUnitPrice, quantity, volumePricing);

  return Math.round(discountedPrice);
}

function applyVolumeDiscount(unitPrice: number, quantity: number, tiers?: Product['volumePricing']): number {
  if (!tiers || tiers.length === 0) return unitPrice;

  // 가장 많이 일치하는 수량 구간 찾기
  const sortedTiers = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity);
  const applicableTier = sortedTiers.find(tier => quantity >= tier.minQuantity);

  if (applicableTier) {
    return unitPrice * (1 - applicableTier.discountRate);
  }

  return unitPrice;
}
