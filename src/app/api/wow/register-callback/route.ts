/**
 * WowPress 콜백 URL 등록 (관리자 1회 실행)
 *
 * POST /api/wow/register-callback
 *
 * 배포 후 최초 1회만 실행하면 됨.
 * WowPress 주문 상태 변경 시 /api/wow/callback 으로 자동 POST됨.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { getWowPressClient } from '@/lib/wowpress/api-client';

export async function POST(req: NextRequest) {
  const { authorized, roles } = await requireRole(req, ['admin']);
  if (!authorized || !roles?.includes('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://goodzz.co.kr';
  const callbackUrl = `${appUrl}/api/wow/callback?type=json`;

  try {
    const client = getWowPressClient();
    await client.registerCallbackUrl(callbackUrl);

    return NextResponse.json({
      success: true,
      message: `콜백 URL 등록 완료: ${callbackUrl}`,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
