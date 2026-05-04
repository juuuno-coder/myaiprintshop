/**
 * WowPress 주문상태 콜백 수신
 *
 * WowPress에서 주문 상태 변경 시 자동 POST 전송 (10초 간격, 최대 10회)
 * 등록: client.registerCallbackUrl(`${APP_URL}/api/wow/callback?type=json`)
 *
 * POST /api/wow/callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleWowCallback } from '@/lib/wowpress/order-forwarder';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? '';
    let payload: Record<string, unknown>;

    if (contentType.includes('application/json')) {
      payload = await req.json();
    } else {
      const form = await req.formData();
      payload = Object.fromEntries(form.entries());
    }

    const { ordnum, ordstat, jobstat, shipnum } = payload as {
      ordnum?: string;
      ordstat?: string | number;
      jobstat?: string | number;
      shipnum?: string;
    };

    if (!ordnum || ordstat == null) {
      return NextResponse.json({ ok: false, error: 'missing params' }, { status: 400 });
    }

    await handleWowCallback({
      ordnum: String(ordnum),
      ordstat: Number(ordstat),
      jobstat: Number(jobstat ?? 0),
      shipnum: shipnum ? String(shipnum) : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[WowCallback] 처리 실패:', err);
    // 200 반환 — WowPress가 실패로 간주해 재시도하지 않도록
    return NextResponse.json({ ok: false, error: (err as Error).message });
  }
}
