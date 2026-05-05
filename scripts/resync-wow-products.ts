/**
 * WowPress 전체 상품 재동기화 (올바른 데이터 구조로)
 * 실행: npx tsx scripts/resync-wow-products.ts
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

if (!getApps().length) {
  initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
}

// sync.ts는 서버 환경을 가정하므로 동일 로직을 여기서 직접 실행
const API_BASE = process.env.WOWPRESS_API_URL ?? 'https://api.wowpress.co.kr';
const TOKEN = process.env.WOWPRESS_TOKEN;

import { getFirestore as fsGet, collection, getDocs, addDoc, updateDoc, query, where } from 'firebase/firestore';
const db = fsGet();

function extractSizes(sizeinfo: any[]) {
  const group = sizeinfo?.find((g: any) => g.covercd === 0) ?? sizeinfo?.[0];
  return (group?.sizelist ?? []).map((s: any) => ({
    sizeno: s.sizeno, sizename: s.sizename, width: s.width ?? 0, height: s.height ?? 0,
  }));
}

function extractColors(colorinfo: any[]) {
  const group = colorinfo?.find((g: any) => g.covercd === 0) ?? colorinfo?.[0];
  const page = group?.pagelist?.find((p: any) => p.pagecd === 0) ?? group?.pagelist?.[0];
  return (page?.colorlist ?? []).map((c: any) => ({
    colorno: c.colorno,
    colorname: c.colorname,
    jobno: c.req_prsjob?.[0]?.jobno ?? c.req_prsjob?.[0]?.jobpresetno ?? 0,
  }));
}

function extractPapers(paperinfo: any[]) {
  const group = paperinfo?.find((g: any) => g.covercd === 0) ?? paperinfo?.[0];
  return (group?.paperlist ?? []).map((p: any) => ({ paperno: p.paperno, papername: p.papername }));
}

function extractAwkJobs(awkjobinfo: any[]) {
  const group = awkjobinfo?.find((g: any) => g.covercd === 0) ?? awkjobinfo?.[0];
  if (!group) return [];
  return (group.jobgrouplist ?? []).flatMap((jg: any) =>
    (jg.awkjoblist ?? []).map((awk: any) => ({
      jobgroupno: jg.jobgroupno, jobgroup: jg.jobgroup, type: jg.type ?? 'select',
      jobno: awk.jobno, jobname: awk.jobname,
    }))
  );
}

function extractOrdQtyList(ordqty: any[]): number[] {
  if (!ordqty?.length) return [100, 200, 300, 500, 1000];
  const universal = ordqty.find((q: any) => !q.paperno && !q.sizeno) ?? ordqty[0];
  if (universal?.ordqtylist?.length) return universal.ordqtylist;
  const list: number[] = [];
  const min = universal?.ordqtymin ?? 100;
  const max = universal?.ordqtymax ?? 1000;
  const interval = universal?.ordqtyinterval ?? min;
  for (let q = min; q <= max && list.length < 10; q += interval) list.push(q);
  return list.length ? list : [min, max];
}

async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (data.resultCode !== '200') throw new Error(`API 오류: ${data.errMsg ?? data.resultCode}`);
  return data.resultMap;
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('WowPress 전체 상품 재동기화 시작...\n');

  const resultMap = await apiGet('/api/v1/std/prodlist');
  const allProducts = resultMap?.prodlist ?? [];
  const products = allProducts.filter((p: any) => p.useyn === 'Y');
  console.log(`총 ${products.length}개 상품 (비활성 ${allProducts.length - products.length}개 제외)\n`);

  let synced = 0, errors = 0;
  const BATCH = 5;

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);

    await Promise.all(batch.map(async (p: any) => {
      try {
        const detailMap = await apiGet(`/api/v1/std/prod_info/${p.prodno}`);
        const detail = detailMap?.prod_info;
        if (!detail) throw new Error('prod_info 없음');

        const sizes = extractSizes(detail.sizeinfo);
        const colors = extractColors(detail.colorinfo);
        const papers = extractPapers(detail.paperinfo);
        const awkJobs = extractAwkJobs(detail.awkjobinfo);
        const ordQtyList = extractOrdQtyList(detail.ordqty);

        const firstSizegroup = detail.sizeinfo?.[0];
        const covercd: number = firstSizegroup?.covercd ?? 0;
        const thumbnailUrl = `https://wowpress.co.kr/wow2.0/prod/images/${p.prodno}/${p.prodno}.jpg`;

        const productData = {
          name: p.name || p.pathname.split('>').pop()?.trim() || p.pathname,
          description: `${p.name} 인쇄 상품 — 와우프레스`,
          price: 0,
          originalPrice: 0,
          thumbnail: thumbnailUrl,
          images: [thumbnailUrl],
          category: (p.pathname.split('>')[0] ?? '기타').trim(),
          tags: ['인쇄', '와우프레스', p.name],
          stock: 9999,
          isActive: p.useyn === 'Y',
          rating: 0,
          reviewCount: 0,
          vendorId: 'VENDOR_WOWPRESS',
          vendorName: '와우프레스',
          vendorType: 'platform',
          wowpressMapping: {
            prodno: p.prodno,
            prodname: p.name,
            jobno: String(colors[0]?.jobno ?? ''),
            sizeno: String(sizes[0]?.sizeno ?? ''),
            colorno0: String(colors[0]?.colorno ?? ''),
            paperno: String(papers[0]?.paperno ?? ''),
            covercd,
          },
          metadata: {
            wowOptions: { sizes, colors, papers, awkJobs, ordQtyList },
            prodmsg: detail.prodmsg ?? null,
            isAutoSynced: true,
            wowprodno: p.prodno,
            wowuseyn: p.useyn,
            lastSyncedAt: new Date().toISOString(),
          },
        };

        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          where('wowpressMapping.prodno', '==', p.prodno),
          where('vendorId', '==', 'VENDOR_WOWPRESS')
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          await updateDoc(snapshot.docs[0].ref, productData);
        } else {
          await addDoc(productsRef, { ...productData, createdAt: new Date().toISOString() });
        }
        synced++;
      } catch (err) {
        errors++;
        console.error(`  ✗ prodno=${p.prodno} (${p.name}): ${(err as Error).message}`);
      }
    }));

    const done = Math.min(i + BATCH, products.length);
    process.stdout.write(`\r진행: ${done}/${products.length} (완료 ${synced}, 오류 ${errors})`);

    if (i + BATCH < products.length) await delay(200);
  }

  console.log(`\n\n✅ 완료: ${synced}개 동기화, ${errors}개 오류`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
