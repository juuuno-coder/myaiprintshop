import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { CartItem, WishlistItem } from '@/store/useStore';

const CARTS_COLLECTION = 'carts';

export interface UserCartData {
  cart: CartItem[];
  wishlist: WishlistItem[];
  updatedAt: string;
}

// 사용자 카트/위시리스트 저장
export async function saveUserCart(userId: string, data: { cart: CartItem[], wishlist: WishlistItem[] }) {
  try {
    const docRef = doc(db, CARTS_COLLECTION, userId);
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving user cart:', error);
    return false;
  }
}

// 사용자 카트/위시리스트 조회
export async function getUserCart(userId: string): Promise<UserCartData | null> {
  try {
    const docRef = doc(db, CARTS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserCartData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user cart:', error);
    return null;
  }
}

// 카트 비우기
export async function clearUserCart(userId: string) {
  try {
    const docRef = doc(db, CARTS_COLLECTION, userId);
    await updateDoc(docRef, {
      cart: [],
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error clearing user cart:', error);
    return false;
  }
}
