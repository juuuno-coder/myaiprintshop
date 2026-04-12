import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/orders';

export async function GET(request: NextRequest) {
  try {
    const vendorId = request.nextUrl.searchParams.get('vendorId');
    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId가 필요합니다.' }, { status: 400 });
    }

    const allOrders = await getOrders({ paymentStatus: 'PAID' });

    // vendorOrders에 해당 vendorId가 포함된 주문만 필터
    const vendorOrders = allOrders
      .filter((order) => order.vendorOrders?.some((vo) => vo.vendorId === vendorId))
      .map((order) => {
        const vo = order.vendorOrders!.find((v) => v.vendorId === vendorId)!;
        return {
          orderId: order.id,
          createdAt: order.createdAt,
          customer: order.shippingInfo?.name || '고객',
          items: vo.items,
          subtotal: vo.subtotal,
          commission: vo.commission,
          vendorAmount: vo.vendorAmount,
          status: vo.status,
          shippingInfo: vo.shippingInfo,
          shippingAddress: order.shippingInfo,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, orders: vendorOrders });
  } catch (error) {
    console.error('Vendor orders API error:', error);
    return NextResponse.json({ error: '주문 조회 실패' }, { status: 500 });
  }
}
