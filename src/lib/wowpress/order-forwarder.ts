/**
 * WowPress 주문 포워더
 *
 * GOODZZ 결제 완료 → WowPress 자동 발주 플로우:
 *   1. 가격 재확인 (cjson_jobcost)
 *   2. 주문 생성 (cjson_order)  — ordkey = GOODZZ 주문 ID (중복방지)
 *   3. 파일 업로드 (uploadasyc)  — 고객 디자인 파일 URL
 *   4. Firestore 로그 저장
 */

import { getWowPressClient, WowOrderRequest, WOW_ORDER_STATUS } from './api-client';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';

export const WOWPRESS_VENDOR_ID = 'VENDOR_WOWPRESS';

// ─── 타입 ─────────────────────────────────────────────────────────────────────

/** GOODZZ 주문 아이템에 저장되어야 할 WowPress 매핑 정보 */
export interface WowPressMapping {
  prodno: number;
  jobno: string;        // prsjob[0].jobno
  sizeno: string;
  colorno0: string;
  paperno: string;
  covercd?: number;
  awkjob?: { jobno: string; covercd?: number }[];
}

// ─── 주문 포워딩 ─────────────────────────────────────────────────────────────

/**
 * GOODZZ 주문을 WowPress로 전달
 *
 * @param order - GOODZZ 주문 객체 (Firestore orders 문서)
 */
export async function forwardOrderToWowPress(order: {
  id: string;
  shippingInfo: {
    name: string; phone: string;
    postalCode?: string;
    sd: string; sgg: string; umd?: string;
    addr1: string; addr2: string;
  };
  vendorOrders?: {
    vendorId: string;
    items: {
      productId: string;
      name: string;
      quantity: number;
      designFileUrl?: string;       // NCP에 업로드된 고객 디자인 파일 URL
      wowpressMapping?: WowPressMapping;
    }[];
  }[];
}): Promise<void> {
  const wowVendorOrders = order.vendorOrders?.filter(
    vo => vo.vendorId === WOWPRESS_VENDOR_ID
  ) ?? [];

  if (wowVendorOrders.length === 0) return;

  const client = getWowPressClient();
  const app_url = process.env.NEXT_PUBLIC_APP_URL ?? 'https://goodzz.co.kr';

  for (const vendorOrder of wowVendorOrders) {
    for (const item of vendorOrder.items) {
      const mapping = item.wowpressMapping;
      if (!mapping) {
        console.error(`[WowPress] wowpressMapping 없음: ${item.productId}`);
        continue;
      }

      const ordkey = `goodzz-${order.id}-${item.productId}`;

      try {
        // 1. 주문 요청 구성
        const orderReq: WowOrderRequest = {
          action: 'ord',
          ordreq: [[{
            prodno: mapping.prodno,
            ordqty: String(item.quantity),
            ordcnt: '1',
            ordtitle: `GOODZZ-${order.id}`,
            ordbody: item.name,
            ordkey,
            prsjob: [{
              jobno: mapping.jobno,
              covercd: mapping.covercd ?? 0,
              sizeno: mapping.sizeno,
              paperno: mapping.paperno,
              colorno0: mapping.colorno0,
            }],
            awkjob: mapping.awkjob?.map(a => ({
              jobno: a.jobno,
              covercd: a.covercd ?? 0,
            })) ?? [],
          }]],
          dcpointreq: 0,
          dlvymcd: '4',   // 선불택배 (기본값)
          dlvyfr: {
            name: 'GOODZZ',
            tel: '070-0000-0000',
            sd: '서울시',
            sgg: '강남구',
            umd: '역삼동',
            addr1: '테헤란로 서울',
            addr2: '',
          },
          dlvyto: {
            name: order.shippingInfo.name,
            tel: order.shippingInfo.phone.replace(/-/g, ''),
            sd: order.shippingInfo.sd,
            sgg: order.shippingInfo.sgg,
            umd: order.shippingInfo.umd,
            addr1: order.shippingInfo.addr1,
            addr2: order.shippingInfo.addr2,
            zipcode: order.shippingInfo.postalCode,
          },
        };

        // 2. 주문 생성
        const result = await client.placeOrder(orderReq);
        const wowOrdnum = result.ordinfo[0]?.ordnum;
        if (!wowOrdnum) throw new Error('WowPress 주문번호 없음');

        console.log(`[WowPress] 주문 완료: ${wowOrdnum} (GOODZZ: ${order.id})`);

        // 3. 파일 업로드 (디자인 파일이 있는 경우)
        if (item.designFileUrl) {
          await client.uploadFileFromUrl({
            ordnum: wowOrdnum,
            filename: `goodzz-${order.id}.pdf`,
            fileurl: item.designFileUrl,
            returnUrl: `${app_url}/api/wow/file-callback/${wowOrdnum}`,
          });
          console.log(`[WowPress] 파일 업로드 요청: ${wowOrdnum}`);
        }

        // 4. Firestore 로그 + 주문 업데이트
        await addDoc(collection(db, 'wowpress_order_logs'), {
          goodzz_order_id: order.id,
          wow_ordnum: wowOrdnum,
          product_id: item.productId,
          ordkey,
          status: 'forwarded',
          cost_bill: result.cost_bill,
          createdAt: Timestamp.now(),
        });

        await updateDoc(doc(db, 'orders', order.id), {
          [`wowpress.${item.productId}`]: {
            ordnum: wowOrdnum,
            status: 'forwarded',
            forwardedAt: Timestamp.now(),
          },
        });

      } catch (err) {
        console.error(`[WowPress] 주문 전달 실패 (${ordkey}):`, err);

        await addDoc(collection(db, 'wowpress_order_logs'), {
          goodzz_order_id: order.id,
          ordkey,
          product_id: item.productId,
          status: 'failed',
          error: (err as Error).message,
          createdAt: Timestamp.now(),
        });
        // 비차단 — WowPress 실패가 GOODZZ 주문 완료를 막지 않음
      }
    }
  }
}

// ─── 주문 상태 동기화 ─────────────────────────────────────────────────────────

/** WowPress 주문상태 → GOODZZ 주문상태 매핑 */
function mapWowStatToGoodzz(ordstat: number): string | null {
  if (ordstat === 20 || ordstat === 30 || ordstat === 70) return 'PREPARING';
  if (ordstat === 80 || ordstat === 84) return 'SHIPPED';
  if (ordstat === 85) return 'DELIVERED';
  if (ordstat === 90) return 'CANCELLED';
  return null;
}

/** WowPress 콜백 수신 후 Firestore 업데이트 */
export async function handleWowCallback(payload: {
  ordnum: string;
  ordstat: number;
  jobstat: number;
  shipnum?: string;
}) {
  const { ordnum, ordstat, shipnum } = payload;

  // wowpress_order_logs에서 GOODZZ 주문 ID 찾기
  const { query, where, getDocs } = await import('firebase/firestore');
  const logsRef = collection(db, 'wowpress_order_logs');
  const snap = await getDocs(query(logsRef, where('wow_ordnum', '==', ordnum)));

  if (snap.empty) {
    console.warn(`[WowPress] 콜백: 알 수 없는 주문번호 ${ordnum}`);
    return;
  }

  const logData = snap.docs[0].data();
  const goodzzOrderId = logData.goodzz_order_id as string;
  const productId = logData.product_id as string;

  const godzStatus = mapWowStatToGoodzz(ordstat);
  const updateData: Record<string, unknown> = {
    [`wowpress.${productId}.status`]: WOW_ORDER_STATUS[ordstat] ?? `status-${ordstat}`,
    [`wowpress.${productId}.updatedAt`]: Timestamp.now(),
  };

  if (godzStatus) updateData.orderStatus = godzStatus;
  if (shipnum) {
    updateData[`wowpress.${productId}.shipnum`] = shipnum;
    updateData.trackingNumber = shipnum;
  }

  await updateDoc(doc(db, 'orders', goodzzOrderId), updateData);

  console.log(`[WowPress] 콜백 처리 완료: ${ordnum} → ${WOW_ORDER_STATUS[ordstat]}`);
}
