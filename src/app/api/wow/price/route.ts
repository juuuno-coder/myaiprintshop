/**
 * POST /api/wow/price
 *
 * WowPress 실시간 가격 조회
 * 고객/판매자가 옵션 선택 시 즉시 가격 계산
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWowPressClient, WowPriceRequest } from '@/lib/wowpress/api-client';

export async function POST(req: NextRequest) {
  try {
    const body: WowPriceRequest = await req.json();

    if (!body.prodno || !body.ordqty || !body.prsjob?.length) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터 누락 (prodno, ordqty, prsjob)' },
        { status: 400 }
      );
    }

    const client = getWowPressClient();
    const result = await client.getPrice(body);

    return NextResponse.json({ success: true, price: result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
