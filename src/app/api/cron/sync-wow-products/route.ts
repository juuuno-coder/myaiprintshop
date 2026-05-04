/**
 * GET /api/cron/sync-wow-products — Vercel Cron 전용 WowPress 상품 동기화
 *
 * 인증: Authorization: Bearer {CRON_SECRET}
 * 항상 HTTP 200 반환 (cron은 실패해도 재시도 안 함)
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncWowPressProducts } from '@/lib/wowpress/sync';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

// Vercel Serverless Function — 최대 300초
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  // production 환경에서만 인증 강제
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Cron/sync-wow-products] Unauthorized 요청 차단');
      // cron 특성상 200 반환 (재시도 방지), 하지만 실행은 하지 않음
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 200 }
      );
    }
  }

  console.log('[Cron/sync-wow-products] WowPress 상품 동기화 시작');
  const startedAt = new Date().toISOString();

  try {
    const result = await syncWowPressProducts();

    const logEntry = {
      triggeredBy: 'cron',
      startedAt,
      completedAt: new Date().toISOString(),
      ...result,
    };

    // wow_sync_logs 컬렉션에 결과 저장
    await addDoc(collection(db, 'wow_sync_logs'), logEntry);

    console.log('[Cron/sync-wow-products] 동기화 완료:', result);

    return NextResponse.json({
      success: true,
      message: '동기화 완료',
      result: logEntry,
    });
  } catch (error) {
    const errMsg = (error as Error).message;
    console.error('[Cron/sync-wow-products] 동기화 실패:', errMsg);

    // cron은 항상 200 반환 (재시도 방지)
    return NextResponse.json({
      success: false,
      error: errMsg,
    });
  }
}
