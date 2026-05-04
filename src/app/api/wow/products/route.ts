/**
 * GET /api/wow/products
 *
 * WowPress 전체 제품 목록 반환 (useyn=Y 필터)
 * 관리자 전용
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { getWowPressClient } from '@/lib/wowpress/api-client';

export async function GET(req: NextRequest) {
  const { authorized, roles } = await requireRole(req, ['admin']);
  if (!authorized || !roles?.includes('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = getWowPressClient();
    const list = await client.getProductList();
    const active = list.filter(p => p.useyn === 'Y');

    return NextResponse.json({ success: true, products: active });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
