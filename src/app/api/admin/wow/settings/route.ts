import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { getWowSettings, saveWowSettings } from '@/lib/wowpress/settings';

export async function GET(request: NextRequest) {
  const { authorized } = await requireRole(request, ['admin']);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getWowSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(request: NextRequest) {
  const { authorized } = await requireRole(request, ['admin']);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const rate = Number(body.globalMarginRate);
  if (!rate || rate < 1.0 || rate > 5.0) {
    return NextResponse.json(
      { error: '마진율은 1.0~5.0 사이여야 합니다' },
      { status: 400 }
    );
  }

  await saveWowSettings({ globalMarginRate: rate });
  return NextResponse.json({ success: true });
}
