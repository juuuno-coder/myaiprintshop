// GET /api/cron/retry-failed-orders
// 매 1시간마다 WowPress 발주 실패 주문 재시도
// Vercel Cron schedule: 0 every-1h * * *

import { NextRequest, NextResponse } from 'next/server';
import { getWowPressClient } from '@/lib/wowpress/api-client';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { forwardOrderToWowPress } from '@/lib/wowpress/order-forwarder';

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  console.log('[Cron/retry-failed-orders] 시작');

  const logsRef = collection(db, 'wowpress_order_logs');
  const snap = await getDocs(
    query(logsRef, where('status', '==', 'failed'))
  );

  if (snap.empty) {
    return NextResponse.json({ success: true, retried: 0 });
  }

  let retried = 0;
  let stillFailed = 0;

  // 최대 10건만 재시도 (타임아웃 방지)
  const targets = snap.docs.slice(0, 10);

  for (const logDoc of targets) {
    const { goodzz_order_id, retryCount = 0 } = logDoc.data() as {
      goodzz_order_id: string;
      retryCount?: number;
    };

    // 5회 이상 실패한 주문은 건너뜀 (수동 처리 필요)
    if (retryCount >= 5) {
      console.warn(`[Retry] ${goodzz_order_id}: 최대 재시도 초과, 스킵`);
      continue;
    }

    try {
      const orderSnap = await getDoc(doc(db, 'orders', goodzz_order_id));
      if (!orderSnap.exists()) {
        console.warn(`[Retry] 주문 없음: ${goodzz_order_id}`);
        continue;
      }

      const order = { id: goodzz_order_id, ...orderSnap.data() } as any;
      await forwardOrderToWowPress(order);

      // 성공 시 로그 상태 업데이트
      await updateDoc(logDoc.ref, {
        status: 'retried_success',
        retriedAt: Timestamp.now(),
        retryCount: retryCount + 1,
      });

      retried++;
      console.log(`[Retry] 재시도 성공: ${goodzz_order_id}`);
    } catch (err) {
      await updateDoc(logDoc.ref, {
        retryCount: retryCount + 1,
        lastRetryAt: Timestamp.now(),
        lastError: (err as Error).message,
      });
      stillFailed++;
      console.error(`[Retry] 재시도 실패: ${goodzz_order_id}`, err);
    }
  }

  console.log(`[Cron/retry-failed-orders] 완료 — 성공: ${retried}, 실패: ${stillFailed}`);

  return NextResponse.json({ success: true, retried, stillFailed });
}
