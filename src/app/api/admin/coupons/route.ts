import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const db = await getAdminFirestore();
    const snap = await db.collection('coupons').orderBy('createdAt', 'desc').get();
    const coupons = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Failed to fetch coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, discountType, discountValue, minOrderAmount, expiresAt, maxUses, description } = body;

    if (!code || !discountType || !discountValue) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });
    }

    const db = await getAdminFirestore();

    // 중복 코드 체크
    const existing = await db.collection('coupons').where('code', '==', code.toUpperCase()).get();
    if (!existing.empty) {
      return NextResponse.json({ error: '이미 존재하는 쿠폰 코드입니다.' }, { status: 409 });
    }

    const coupon = {
      code: code.toUpperCase(),
      discountType, // 'fixed' | 'percent'
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxUses: Number(maxUses) || 0, // 0 = 무제한
      usedCount: 0,
      description: description || '',
      expiresAt: expiresAt || null,
      active: true,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('coupons').add(coupon);

    return NextResponse.json({ success: true, id: docRef.id, coupon: { id: docRef.id, ...coupon } });
  } catch (error) {
    console.error('Failed to create coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, active } = body;

    if (!id || typeof active !== 'boolean') {
      return NextResponse.json({ error: 'id와 active 필드가 필요합니다.' }, { status: 400 });
    }

    const db = await getAdminFirestore();
    await db.collection('coupons').doc(id).update({ active });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update coupon:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}
