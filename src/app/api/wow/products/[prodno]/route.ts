/**
 * GET /api/wow/products/[prodno]
 *
 * WowPress 제품 상세 (옵션 포함)
 * 매핑 UI에서 prodno 입력 후 옵션 조회에 사용
 * 관리자 전용
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { getWowPressClient } from '@/lib/wowpress/api-client';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ prodno: string }> }
) {
  const { authorized, roles } = await requireRole(req, ['admin']);
  if (!authorized || !roles?.includes('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { prodno } = await context.params;
    const client = getWowPressClient();
    const detail = await client.getProductDetail(Number(prodno));

    return NextResponse.json({ success: true, product: detail });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
