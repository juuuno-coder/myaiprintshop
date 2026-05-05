// GET /api/cron/sync-wowpress-orders
// 4시간마다 WowPress 진행 중 주문 상태 폴링 (콜백 누락 복구)
// Vercel Cron schedule: 0 every-4h * * *

import { NextRequest, NextResponse } from 'next/server';
import { syncActiveOrders } from '@/lib/wowpress/order-forwarder';

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  console.log('[Cron/sync-wowpress-orders] 시작');

  try {
    const result = await syncActiveOrders();
    console.log('[Cron/sync-wowpress-orders] 완료:', result);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err) {
    console.error('[Cron/sync-wowpress-orders] 실패:', err);
    // 항상 200 반환 — Vercel Cron 재시도 방지
    return NextResponse.json({ success: false, error: (err as Error).message });
  }
}
