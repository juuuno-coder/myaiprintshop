/**
 * POST /api/wow/price
 *
 * WowPress 실시간 가격 조회
 * 고객/판매자가 옵션 선택 시 즉시 가격 계산
 *
 * Body 포맷 (두 가지 모두 지원):
 *  A) { prodno, ordqty, prsjob: [{jobno, sizeno?, paperno?, colorno0?, covercd?}] }
 *  B) { prodno, ordqty, jobno, sizeno, colorno0, paperno, covercd?, ordcnt? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWowPressClient } from '@/lib/wowpress/api-client';

interface PriceBody {
  prodno: number;
  ordqty: number | string;
  ordcnt?: number | string;
  // Format A: 직접 prsjob
  prsjob?: {
    jobno: string;
    sizeno?: string;
    paperno?: string;
    colorno0?: string;
    covercd?: number;
  }[];
  // Format B: 개별 옵션 (자동 동기화 상품용)
  jobno?: string;
  sizeno?: string;
  colorno0?: string;
  paperno?: string;
  covercd?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: PriceBody = await req.json();

    if (!body.prodno || !body.ordqty) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터 누락 (prodno, ordqty)' },
        { status: 400 }
      );
    }

    // prsjob 구성: Format A 우선, 없으면 Format B로 조립
    let prsjob: ReturnType<typeof buildPrsjob>;
    if (body.prsjob?.length) {
      prsjob = body.prsjob.map(j => ({
        jobno: j.jobno,
        sizeno: j.sizeno ?? '',
        paperno: j.paperno ?? '',
        colorno0: j.colorno0 ?? '',
        covercd: j.covercd ?? 0,
        wsize: '',
        hsize: '',
        joboptmsg: '',
        colorno0add: '',
      }));
    } else if (body.jobno) {
      prsjob = buildPrsjob(body);
    } else {
      return NextResponse.json(
        { success: false, error: 'prsjob 또는 jobno 필요' },
        { status: 400 }
      );
    }

    const client = getWowPressClient();
    const result = await client.getPrice({
      prodno: Number(body.prodno),
      ordqty: String(body.ordqty),
      ordcnt: String(body.ordcnt ?? 1),
      ordtitle: '가격조회',
      prsjob,
      awkjob: [],
    });

    // 총액 계산 (청구가 = 공급가 + 부가세)
    const totprc = result.ordcost_bill ?? (result.ordcost_sup + result.ordcost_tax);

    return NextResponse.json({
      success: true,
      price: {
        ...result,
        totprc,
      },
    });
  } catch (err) {
    console.error('[/api/wow/price]', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

function buildPrsjob(body: PriceBody) {
  return [{
    jobno: body.jobno!,
    sizeno: body.sizeno ?? '',
    paperno: body.paperno ?? '',
    colorno0: body.colorno0 ?? '',
    covercd: body.covercd ?? 0,
    wsize: '',
    hsize: '',
    joboptmsg: '',
    colorno0add: '',
  }];
}
