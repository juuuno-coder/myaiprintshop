/**
 * WowPress 제품 정보 조회 (관리자용 미리보기)
 *
 * GET  /api/wowpress/sync/product/[prodno]  — 제품 상세 조회
 * POST /api/wowpress/sync/product/[prodno]  — (향후) GOODZZ 카탈로그에 등록
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { getWowPressClient } from '@/lib/wowpress/api-client';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ prodno: string }> }
) {
  const { authorized, roles } = await requireRole(request, ['admin']);
  if (!authorized || !roles?.includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { prodno } = await context.params;
    const client = getWowPressClient();
    const detail = await client.getProductDetail(Number(prodno));

    return NextResponse.json({ success: true, data: detail });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ prodno: string }> }
) {
  const { authorized, roles } = await requireRole(request, ['admin']);
  if (!authorized || !roles?.includes('admin')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { prodno } = await context.params;
    const client = getWowPressClient();
    const detail = await client.getProductDetail(Number(prodno));

    // TODO: createProduct()로 GOODZZ 카탈로그 등록
    // wowpressMapping 필드에 prodno, jobno, sizeno 등 저장 필요

    return NextResponse.json({
      success: true,
      message: '제품 조회 성공 (카탈로그 등록은 관리자 UI에서 진행)',
      data: { prodno: detail.prodno, prodname: detail.prodname },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
