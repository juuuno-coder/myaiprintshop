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

import { uploadFile } from './storage-service';

/**
 * AI 디자인 이미지를 통합 스토리지 시스템에 업로드합니다.
 * @param userId 사용자 ID
 * @param imageSource 이미지 URL 또는 base64 데이터
 * @returns 업로드된 이미지의 영구 다운로드 URL
 */
export async function uploadDesignImage(userId: string, imageSource: string): Promise<string | null> {
  try {
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
    const path = `designs/${userId}/${filename}`;

    let fileData: string | Blob;
    if (imageSource.startsWith('data:image')) {
      fileData = imageSource;
    } else {
      const response = await fetch(imageSource);
      fileData = await response.blob();
    }

    return await uploadFile(fileData, { path });
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
