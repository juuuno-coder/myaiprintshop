import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadString, 
  getDownloadURL,
  uploadBytes
} from 'firebase/storage';
import { db, storage } from './firebase';

export interface DesignDraft {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  previewUrl: string;
  designData: any; // Canvas state (e.g. Fabric.js JSON or custom format)
  status?: 'draft' | 'submitted' | 'approved';
  createdAt: string;
  updatedAt: string;
}

const DESIGNS_COLLECTION = 'designs';

/**
 * AI 디자인 이미지를 Firebase Storage에 업로드합니다.
 * @param userId 사용자 ID
 * @param imageSource 이미지 URL 또는 base64 데이터
 * @returns 업로드된 이미지의 영구 다운로드 URL
 */
export async function uploadDesignImage(userId: string, imageSource: string): Promise<string | null> {
  try {
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
    const storageRef = ref(storage, `designs/${userId}/${filename}`);

    if (imageSource.startsWith('data:image')) {
      // Base64 업로드
      await uploadString(storageRef, imageSource, 'data_url');
    } else {
      // URL로부터 이미지 페치 및 업로드 (CORS 주의)
      // 주의: 클라이언트 측에서 직접 대량 이미지를 fetch할 때 CORS 에러가 날 수 있음.
      // OpenAI/Unsplash 등은 보통 클라이언트 측 fetch를 허용하거나, 업로드할 이미지를 브라우저에서 canvas로 그려서 가져와야 함.
      const response = await fetch(imageSource);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
    }

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading design image:', error);
    return null;
  }
}

// 디자인 저장 (신규 또는 수정)
export async function saveDesign(userId: string, data: Omit<DesignDraft, 'id' | 'createdAt' | 'updatedAt' | 'userId'>, designId?: string) {
  try {
    if (designId) {
      const docRef = doc(db, DESIGNS_COLLECTION, designId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return designId;
    } else {
      const docRef = await addDoc(collection(db, DESIGNS_COLLECTION), {
        ...data,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving design:', error);
    return null;
  }
}

// 사용자의 디자인 목록 조회
export async function getUserDesigns(userId: string): Promise<DesignDraft[]> {
  try {
    const q = query(
      collection(db, DESIGNS_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DesignDraft[];
  } catch (error) {
    console.error('Error getting user designs:', error);
    return [];
  }
}

// 특정 디자인 조회
export async function getDesignById(designId: string): Promise<DesignDraft | null> {
  try {
    const docRef = doc(db, DESIGNS_COLLECTION, designId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as DesignDraft;
    }
    return null;
  } catch (error) {
    console.error('Error getting design:', error);
    return null;
  }
}

// 디자인 삭제
export async function deleteDesign(designId: string) {
  try {
    await deleteDoc(doc(db, DESIGNS_COLLECTION, designId));
    return true;
  } catch (error) {
    console.error('Error deleting design:', error);
    return false;
  }
}
