/**
 * POST /api/admin/wow/sync  — WowPress 상품 전체 동기화 트리거
 * GET  /api/admin/wow/sync  — 최근 동기화 상태 조회
 *
 * 인증: x-admin-secret 헤더 (process.env.ADMIN_SECRET || process.env.CRON_SECRET)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { syncWowPressProducts } from '@/lib/wowpress/sync';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

// Vercel Serverless Function — 최대 300초
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const { authorized } = await requireRole(request, ['admin']);
  if (!authorized) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Admin/wow/sync] WowPress 상품 동기화 시작');
  const startedAt = new Date().toISOString();

  try {
    const result = await syncWowPressProducts();

    const logEntry = {
      triggeredBy: 'admin',
      startedAt,
      completedAt: new Date().toISOString(),
      ...result,
    };

    // wow_sync_logs 컬렉션에 결과 저장
    await addDoc(collection(db, 'wow_sync_logs'), logEntry);

    console.log('[Admin/wow/sync] 동기화 완료:', result);

    return NextResponse.json({
      success: true,
      message: '동기화 완료',
      result: logEntry,
    });
  } catch (error) {
    const errMsg = (error as Error).message;
    console.error('[Admin/wow/sync] 동기화 실패:', errMsg);

    return NextResponse.json(
      { success: false, error: errMsg },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { authorized } = await requireRole(request, ['admin']);
  if (!authorized) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const logsRef = collection(db, 'wow_sync_logs');
    const q = query(logsRef, orderBy('completedAt', 'desc'), limit(10));
    const snapshot = await getDocs(q);

    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    const errMsg = (error as Error).message;
    console.error('[Admin/wow/sync] 로그 조회 실패:', errMsg);

    return NextResponse.json(
      { success: false, error: errMsg },
      { status: 500 }
    );
  }
}
