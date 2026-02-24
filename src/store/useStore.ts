
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  cartId: string; // Unique ID for cart item (diff from product id due to options)
  productId: string;
  name: string;
  price: number;
  thumbnail: string;
  quantity: number;
  size?: string;
  color?: string;
  customDesignUrl?: string | null;
  selectedOptions?: { groupLabel: string; valueLabel: string }[];
  metadata?: Record<string, any>;
}

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  thumbnail: string;
  category: string;
}

interface ShopState {
  cart: CartItem[];
  wishlist: WishlistItem[];
  
  addToCart: (item: Omit<CartItem, 'cartId'>) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  clearCart: () => void;
  
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useStore = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],

      addToCart: (item) => set((state) => {
        // 옵션 객체를 문자열화하여 고유 ID 생성 (중복 방지)
        const optionsStr = JSON.stringify(item.selectedOptions || []);
        const cartId = `${item.productId}-${item.size}-${item.color}-${item.customDesignUrl || 'base'}-${optionsStr}`;
        const existing = state.cart.find((i) => i.cartId === cartId);

        if (existing) {
          return {
            cart: state.cart.map((i) => 
              i.cartId === cartId ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          };
        }
        return { cart: [...state.cart, { ...item, cartId }] };
      }),

      removeFromCart: (cartId) => set((state) => ({
        cart: state.cart.filter((i) => i.cartId !== cartId),
      })),

      updateQuantity: (cartId, delta) => set((state) => ({
        cart: state.cart.map((i) => {
            if (i.cartId === cartId) {
                const newQty = i.quantity + delta;
                return newQty > 0 ? { ...i, quantity: newQty } : i;
            }
            return i;
        })
      })),

      clearCart: () => set({ cart: [] }),

      toggleWishlist: (item) => set((state) => {
        const exists = state.wishlist.some((i) => i.productId === item.productId);
        if (exists) {
            return { wishlist: state.wishlist.filter((i) => i.productId !== item.productId) };
        }
        return { wishlist: [...state.wishlist, item] };
      }),

      isInWishlist: (productId) => get().wishlist.some(i => i.productId === productId),
    }),
    {
      name: 'shop-storage', // local storage key
    }
  )
);
