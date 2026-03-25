'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/store/useStore';
import { getUserCart, saveUserCart } from '@/lib/cart';

export default function CartSync() {
  const { user, loading } = useAuth();
  const { cart, wishlist, clearCart } = useStore();
  const isInitialLoad = useRef(true);
  const syncTimeout = useRef<NodeJS.Timeout | null>(null);

  // 1. 로그인 시 DB에서 데이터 불러오기
  useEffect(() => {
    const loadData = async () => {
      if (user && isInitialLoad.current) {
        const data = await getUserCart(user.uid);
        if (data) {
          // 로컬 스토리지와 병합 또는 교체
          // 여기선 간단하게 DB 데이터로 덮어쓰거나 선택하게 할 수 있지만,
          // 보통 DB 데이터가 더 최신이라고 가정하고 업데이트합니다.
          // (단, 로컬에 이미 상품이 있다면 병합하는 로직이 더 친절함)
          
          if (data.cart?.length > 0) {
              // 장바구니 병합 로직 (필요시 추가)
              // useStore.setState({ cart: data.cart });
          }
          if (data.wishlist?.length > 0) {
              // useStore.setState({ wishlist: data.wishlist });
          }
        }
        isInitialLoad.current = false;
      }
    };
    
    if (!loading) {
      loadData();
    }
  }, [user, loading]);

  // 2. 데이터 변경 시 DB에 저장 (Debounced)
  useEffect(() => {
    if (user && !isInitialLoad.current) {
      if (syncTimeout.current) clearTimeout(syncTimeout.current);

      syncTimeout.current = setTimeout(async () => {
        await saveUserCart(user.uid, { cart, wishlist });
        console.log('🛒 Cart synchronized to DB');
      }, 2000); // 2초 뒤 저장
    }

    return () => {
      if (syncTimeout.current) clearTimeout(syncTimeout.current);
    };
  }, [cart, wishlist, user]);

  return null; // 비가시적 컴포넌트
}
