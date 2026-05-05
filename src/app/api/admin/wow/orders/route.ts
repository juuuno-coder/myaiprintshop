/**
 * GET /api/admin/wow/orders
 *
 * WowPress 발주 현황 조회 (어드민 전용)
 * - Firestore wowpress_order_logs 컬렉션에서 최근 100건 조회
 * - ?status=failed|forwarded|retried_success 필터 가능
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from 'firebase/firestore';

export async function GET(request: NextRequest) {
  const { authorized } = await requireRole(request, ['admin']);
  if (!authorized) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');

  try {
    const logsRef = collection(db, 'wowpress_order_logs');
    const constraints: Parameters<typeof query>[1][] = [
      orderBy('createdAt', 'desc'),
      limit(100),
    ];
    if (statusFilter) {
      constraints.unshift(where('status', '==', statusFilter));
    }

    const snap = await getDocs(query(logsRef, ...constraints));
    const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // 상태별 집계
    const summary = {
      total: logs.length,
      forwarded: logs.filter((l: any) => l.status === 'forwarded').length,
      failed: logs.filter((l: any) => l.status === 'failed').length,
      retried_success: logs.filter((l: any) => l.status === 'retried_success').length,
    };

    return NextResponse.json({ success: true, logs, summary });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/wow/orders  { action: 'retry', logId: '...' }
 * 단건 재시도
 */
export async function POST(request: NextRequest) {
  const { authorized } = await requireRole(request, ['admin']);
  if (!authorized) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { action, logId } = await request.json();

  if (action !== 'retry' || !logId) {
    return NextResponse.json({ success: false, error: 'action=retry, logId 필요' }, { status: 400 });
  }

  const { forwardOrderToWowPress } = await import('@/lib/wowpress/order-forwarder');
  const { doc, getDoc, updateDoc, Timestamp } = await import('firebase/firestore');

  const logSnap = await getDoc(doc(db, 'wowpress_order_logs', logId));
  if (!logSnap.exists()) {
    return NextResponse.json({ success: false, error: '로그 없음' }, { status: 404 });
  }

  const { goodzz_order_id } = logSnap.data();
  const orderSnap = await getDoc(doc(db, 'orders', goodzz_order_id));
  if (!orderSnap.exists()) {
    return NextResponse.json({ success: false, error: '주문 없음' }, { status: 404 });
  }

  try {
    const order = { id: goodzz_order_id, ...orderSnap.data() } as any;
    await forwardOrderToWowPress(order);
    await updateDoc(doc(db, 'wowpress_order_logs', logId), {
      status: 'retried_success',
      retriedAt: Timestamp.now(),
    });
    return NextResponse.json({ success: true, message: '재시도 완료' });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
