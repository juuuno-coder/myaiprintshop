/**
 * WowPress 상품 동기화 로직
 *
 * WowPress prodlist 전체를 Firestore products 컬렉션에 upsert
 */

import { getWowPressClient } from './api-client';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';

export const VENDOR_WOWPRESS_ID = 'VENDOR_WOWPRESS';

export interface SyncResult {
  synced: number;
  skipped: number;
  errors: string[];
  total: number;
}

interface WowSizeInfo {
  sizeno: string;
  sizename: string;
  jobno: string;
}

interface WowColorInfo {
  colorno: string;
  colorname: string;
}

interface WowPaperInfo {
  sizeno: string;
  paperno: string;
  papername: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function syncWowPressProducts(): Promise<SyncResult> {
  const client = getWowPressClient();
  const result: SyncResult = { synced: 0, skipped: 0, errors: [], total: 0 };

  // 1. 전체 상품 목록 조회
  const products = await client.getProductList();
  result.total = products.length;

  // 2. 5개씩 배치 처리
  for (let i = 0; i < products.length; i += 5) {
    const batch = products.slice(i, i + 5);

    await Promise.all(
      batch.map(async (wowProduct) => {
        try {
          // prod_info 상세 조회
          const detail = await client.getProductDetail(wowProduct.prodno);

          const sizeinfo = (detail.sizeinfo as WowSizeInfo[]) ?? [];
          const colorinfo = (detail.colorinfo as WowColorInfo[]) ?? [];
          const paperinfo = (detail.paperinfo as WowPaperInfo[]) ?? [];

          const defaultSize = sizeinfo[0];
          const defaultColor = colorinfo[0];
          const defaultPaper =
            paperinfo.find((p) => p.sizeno === defaultSize?.sizeno) ??
            paperinfo[0];

          const productData = {
            name: wowProduct.prodname || wowProduct.pathname,
            description: `${wowProduct.prodname} 인쇄 상품 — 와우프레스`,
            price: 0,
            originalPrice: 0,
            thumbnail: `https://wowpress.co.kr/wow2.0/prod/images/${wowProduct.prodno}/${wowProduct.prodno}.jpg`,
            images: [] as string[],
            category: '인쇄',
            tags: ['인쇄', '와우프레스', wowProduct.prodname],
            badge: undefined as string | undefined,
            stock: 9999,
            isActive: wowProduct.useyn === 'Y',
            rating: 0,
            reviewCount: 0,
            vendorId: VENDOR_WOWPRESS_ID,
            vendorName: '와우프레스',
            vendorType: 'platform' as const,
            wowpressMapping: {
              prodno: wowProduct.prodno,
              prodname: wowProduct.prodname,
              jobno: defaultSize?.jobno ?? '',
              sizeno: defaultSize?.sizeno ?? '',
              colorno0: defaultColor?.colorno ?? '',
              paperno: defaultPaper?.paperno ?? '',
              covercd: 0,
            },
            metadata: {
              wowOptions: {
                sizes: sizeinfo.map((s) => ({
                  sizeno: s.sizeno,
                  sizename: s.sizename,
                  jobno: s.jobno,
                })),
                colors: colorinfo.map((c) => ({
                  colorno: c.colorno,
                  colorname: c.colorname,
                })),
                papers: paperinfo.map((p) => ({
                  sizeno: p.sizeno,
                  paperno: p.paperno,
                  papername: p.papername,
                })),
              },
              isAutoSynced: true,
              wowprodno: wowProduct.prodno,
              wowuseyn: wowProduct.useyn,
              lastSyncedAt: new Date().toISOString(),
            },
          };

          // Firestore: 기존 문서 조회 (prodno + vendorId 조건)
          const productsRef = collection(db, 'products');
          const q = query(
            productsRef,
            where('wowpressMapping.prodno', '==', wowProduct.prodno),
            where('vendorId', '==', VENDOR_WOWPRESS_ID)
          );
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            // 기존 문서 업데이트
            const docRef = snapshot.docs[0].ref;
            await updateDoc(docRef, productData);
          } else {
            // 새 문서 추가
            await addDoc(productsRef, {
              ...productData,
              createdAt: new Date().toISOString(),
            });
          }

          result.synced++;
        } catch (err) {
          const msg = `prodno=${wowProduct.prodno} (${wowProduct.prodname}): ${(err as Error).message}`;
          console.error('[WowSync] 상품 동기화 실패:', msg);
          result.errors.push(msg);
        }
      })
    );

    // 배치 간 200ms delay (rate limit 방지)
    if (i + 5 < products.length) {
      await delay(200);
    }
  }

  return result;
}
