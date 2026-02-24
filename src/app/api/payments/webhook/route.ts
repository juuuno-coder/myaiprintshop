import { NextRequest, NextResponse } from 'next/server';
import { updateOrder, getOrderById } from '@/lib/orders';
import { sendOrderConfirmNotification } from '@/lib/notifications';

/**
 * PortOne 결제 웹후크 처리 핸들러
 * https://developers.portone.io/docs/ko/webhook/v1-guide
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imp_uid, merchant_uid, status } = body;

        console.log(`[Payment Webhook] Received: imp_uid=${imp_uid}, merchant_uid=${merchant_uid}, status=${status}`);

        // 1. 주문 조회
        const orderId = merchant_uid; // 보통 merchant_uid를 orderId로 사용
        const order = await getOrderById(orderId);

        if (!order) {
            console.error(`Order not found: ${orderId}`);
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }

        // 2. 결제 상태에 따른 처리
        if (status === 'paid') {
            // 결제 완료 처리
            await updateOrder(orderId, {
                paymentStatus: 'PAID',
                orderStatus: 'PAID',
                paymentId: imp_uid,
                updatedAt: new Date().toISOString()
            });

            // 3. 알림톡 자동 발송
            await sendOrderConfirmNotification(order);
            
            console.log(`Order ${orderId} confirmed and notification sent.`);
        } else if (status === 'cancelled') {
            await updateOrder(orderId, {
                paymentStatus: 'CANCELLED',
                orderStatus: 'CANCELLED',
                updatedAt: new Date().toISOString()
            });
            console.log(`Order ${orderId} cancelled.`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook processing failed:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
