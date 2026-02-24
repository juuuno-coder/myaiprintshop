import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem, PaymentRequestData } from '@/lib/payment';
import { createOrder } from '@/lib/orders';

// 주문 ID 생성 (Firestore 전용이 아닌 포트원 표시용으로 사용 가능)
function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

// POST: 결제 요청 (주문 생성)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { items, shippingInfo, totalAmount, shippingFee, userId } = body as {
      items: OrderItem[];
      shippingInfo: Order['shippingInfo'];
      totalAmount: number;
      shippingFee: number;
      userId?: string;
    };

    // 유효성 검사
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: '주문 상품이 없습니다.' },
        { status: 400 }
      );
    }

    if (!shippingInfo || !shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      return NextResponse.json(
        { error: '배송 정보가 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 주문 생성 (Firestore에 PENDING 상태로 저장)
    const customOrderId = generateOrderId();
    
    const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      items,
      totalAmount,
      shippingFee,
      shippingInfo,
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING',
      ...(userId ? { userId } : {}),
    };

    // Firestore에 주문 생성 (ID는 Firestore가 자동 생성하거나 수동 지정 가능)
    // 여기서는 수동 지정한 customOrderId를 사용하거나 Firestore ID를 사용
    const orderId = await createOrder(orderData);
    
    if (!orderId) {
      throw new Error('Failed to create order in database');
    }

    const orderName = items.length > 1 
      ? `${items[0].productName} 외 ${items.length - 1}건`
      : items[0].productName;

    // 결제 요청 데이터 생성
    const paymentRequest: PaymentRequestData = {
      orderId, // Firestore 문서 ID를 주문 번호로 사용
      orderName,
      totalAmount: totalAmount + shippingFee,
      customer: {
        name: shippingInfo.name,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
      },
    };

    return NextResponse.json({
      success: true,
      orderId,
      paymentRequest,
    });

  } catch (error) {
    console.error('Payment request error:', error);
    return NextResponse.json(
      { error: '주문 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
