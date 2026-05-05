/**
 * WowPress 상품 동기화 로직
 *
 * WowPress prodlist 전체를 Firestore products 컬렉션에 upsert
 * API 실제 구조:
 *   sizeinfo  = [{ covercd, sizelist: [{ sizeno, sizename, width, height }] }]
 *   colorinfo = [{ covercd, pagelist: [{ pagecd, type, colorlist: [{ colorno, colorname, req_prsjob: [{jobno}] }] }] }]
 *   paperinfo = [{ covercd, paperlist: [{ paperno, papername }] }]
 *   awkjobinfo= [{ covercd, type, jobgrouplist: [{ jobgroupno, jobgroup, type, awkjoblist: [{jobno, jobname}] }] }]
 *   ordqty    = [{ type, paperno, sizeno, ordqtymin, ordqtymax, ordqtylist }]
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

export function pathnameToCategory(pathname: string): string {
  const main = pathname.split('>')[0].trim();
  return main || '기타';
}

export interface SyncResult {
  synced: number;
  skipped: number;
  errors: string[];
  total: number;
}

// ─── 옵션 추출 헬퍼 ─────────────────────────────────────────────────────────

export interface WowSize {
  sizeno: number;
  sizename: string;
  width: number;
  height: number;
}

export interface WowColor {
  colorno: number;
  colorname: string;
  jobno: number | string;  // colorinfo → req_prsjob[0].jobno
}

export interface WowPaper {
  paperno: number;
  papername: string;
}

export interface WowAwkJob {
  jobgroupno: number;
  jobgroup: string;
  type: string;     // "select" | "checkbox"
  jobno: number;
  jobname: string;
}

function extractSizes(sizeinfo: any[]): WowSize[] {
  const group = sizeinfo?.find((g: any) => g.covercd === 0) ?? sizeinfo?.[0];
  return (group?.sizelist ?? []).map((s: any) => ({
    sizeno: s.sizeno,
    sizename: s.sizename,
    width: s.width ?? 0,
    height: s.height ?? 0,
  }));
}

function extractColors(colorinfo: any[]): WowColor[] {
  const group = colorinfo?.find((g: any) => g.covercd === 0) ?? colorinfo?.[0];
  const page = group?.pagelist?.find((p: any) => p.pagecd === 0) ?? group?.pagelist?.[0];
  return (page?.colorlist ?? []).map((c: any) => ({
    colorno: c.colorno,
    colorname: c.colorname,
    jobno: c.req_prsjob?.[0]?.jobno ?? c.req_prsjob?.[0]?.jobpresetno ?? 0,
  }));
}

function extractPapers(paperinfo: any[]): WowPaper[] {
  const group = paperinfo?.find((g: any) => g.covercd === 0) ?? paperinfo?.[0];
  return (group?.paperlist ?? []).map((p: any) => ({
    paperno: p.paperno,
    papername: p.papername,
  }));
}

function extractAwkJobs(awkjobinfo: any[]): WowAwkJob[] {
  const group = awkjobinfo?.find((g: any) => g.covercd === 0) ?? awkjobinfo?.[0];
  if (!group) return [];
  return (group.jobgrouplist ?? []).flatMap((jg: any) =>
    (jg.awkjoblist ?? []).map((awk: any) => ({
      jobgroupno: jg.jobgroupno,
      jobgroup: jg.jobgroup,
      type: jg.type ?? 'select',
      jobno: awk.jobno,
      jobname: awk.jobname,
    }))
  );
}

function extractOrdQtyList(ordqty: any[]): number[] {
  if (!ordqty?.length) return [100, 200, 300, 500, 1000];
  // 제약 없는 공통 수량 목록 우선, 없으면 첫 번째 사용
  const universal = ordqty.find((q: any) => !q.paperno && !q.sizeno) ?? ordqty[0];
  if (universal?.ordqtylist?.length) return universal.ordqtylist;
  // 범위 기반 생성
  const list: number[] = [];
  const min = universal?.ordqtymin ?? 100;
  const max = universal?.ordqtymax ?? 1000;
  const interval = universal?.ordqtyinterval ?? min;
  for (let q = min; q <= max && list.length < 10; q += interval) list.push(q);
  return list.length ? list : [min, max];
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── 메인 동기화 ─────────────────────────────────────────────────────────────

export async function syncWowPressProducts(): Promise<SyncResult> {
  const client = getWowPressClient();
  const result: SyncResult = { synced: 0, skipped: 0, errors: [], total: 0 };

  // 1. 전체 상품 목록 조회
  const products = await client.getProductList();
  // 인쇄 상품(prdclass=P)만 동기화 (샘플/전용 제품 제외)
  const printProducts = products.filter((p) => p.useyn === 'Y');
  result.total = printProducts.length;

  // 2. 5개씩 배치 처리
  for (let i = 0; i < printProducts.length; i += 5) {
    const batch = printProducts.slice(i, i + 5);

    await Promise.all(
      batch.map(async (wowProduct) => {
        try {
          // prod_info 상세 조회
          const detail = await client.getProductDetail(wowProduct.prodno);

          const sizes = extractSizes(detail.sizeinfo as any[]);
          const colors = extractColors(detail.colorinfo as any[]);
          const papers = extractPapers(detail.paperinfo as any[]);
          const awkJobs = extractAwkJobs(detail.awkjobinfo as any[]);
          const ordQtyList = extractOrdQtyList(detail.ordqty as any[]);

          const defaultSize = sizes[0];
          const defaultColor = colors[0];
          const defaultPaper = papers[0];

          // 커버코드 (대부분 0)
          const firstSizegroup = (detail.sizeinfo as any[])?.[0];
          const covercd: number = firstSizegroup?.covercd ?? 0;

          const thumbnailUrl = `https://wowpress.co.kr/wow2.0/prod/images/${wowProduct.prodno}/${wowProduct.prodno}.jpg`;

          const productData = {
            name: wowProduct.name || wowProduct.pathname.split('>').pop()?.trim() || wowProduct.pathname,
            description: `${wowProduct.name} 인쇄 상품 — 와우프레스`,
            price: 0,
            originalPrice: 0,
            thumbnail: thumbnailUrl,
            images: [thumbnailUrl],
            category: pathnameToCategory(wowProduct.pathname),
            tags: ['인쇄', '와우프레스', wowProduct.name],
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
              prodname: wowProduct.name,
              jobno: String(defaultColor?.jobno ?? ''),
              sizeno: String(defaultSize?.sizeno ?? ''),
              colorno0: String(defaultColor?.colorno ?? ''),
              paperno: String(defaultPaper?.paperno ?? ''),
              covercd,
            },
            metadata: {
              wowOptions: {
                sizes,
                colors,
                papers,
                awkJobs,
                ordQtyList,
              },
              prodmsg: (detail as any).prodmsg ?? null,
              isAutoSynced: true,
              wowprodno: wowProduct.prodno,
              wowuseyn: wowProduct.useyn,
              lastSyncedAt: new Date().toISOString(),
            },
          };

          // Firestore upsert
          const productsRef = collection(db, 'products');
          const q = query(
            productsRef,
            where('wowpressMapping.prodno', '==', wowProduct.prodno),
            where('vendorId', '==', VENDOR_WOWPRESS_ID)
          );
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            await updateDoc(snapshot.docs[0].ref, productData);
          } else {
            await addDoc(productsRef, {
              ...productData,
              createdAt: new Date().toISOString(),
            });
          }

          result.synced++;
        } catch (err) {
          const msg = `prodno=${wowProduct.prodno} (${wowProduct.name}): ${(err as Error).message}`;
          console.error('[WowSync] 상품 동기화 실패:', msg);
          result.errors.push(msg);
        }
      })
    );

    if (i + 5 < printProducts.length) {
      await delay(200);
    }
  }

  return result;
}
