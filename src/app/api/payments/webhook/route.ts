import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { updateOrder, getOrderById } from '@/lib/orders';
import { sendOrderConfirmNotification } from '@/lib/notifications';
import { PORTONE_CONFIG } from '@/lib/payment';

const WEBHOOK_SECRET = process.env.PORTONE_WEBHOOK_SECRET || '';

// 리플레이 방지: 처리된 msgId를 TTL 캐시로 추적 (10분)
const processedWebhooks = new Map<string, number>();
const REPLAY_TTL = 10 * 60_000;

function isReplay(msgId: string): boolean {
  const now = Date.now();
  // 오래된 엔트리 정리
  if (processedWebhooks.size > 200) {
    for (const [id, ts] of processedWebhooks) {
      if (now - ts > REPLAY_TTL) processedWebhooks.delete(id);
    }
  }
  if (processedWebhooks.has(msgId)) return true;
  processedWebhooks.set(msgId, now);
  return false;
}

/**
 * Standard Webhooks 서명 검증 (PortOne V2)
 * https://developers.portone.io/opi/ko/integration/webhook/readme-v2
 */
function verifyWebhookSignature(body: string, headers: Headers): boolean {
  if (!WEBHOOK_SECRET) {
    console.error('[Webhook] PORTONE_WEBHOOK_SECRET not configured');
    return false;
  }

  const msgId = headers.get('webhook-id');
  const msgTimestamp = headers.get('webhook-timestamp');
  const msgSignature = headers.get('webhook-signature');

  if (!msgId || !msgTimestamp || !msgSignature) {
    console.error('[Webhook] Missing signature headers');
    return false;
  }

  // 타임스탬프 검증 (5분 이내)
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(msgTimestamp, 10);
  if (Math.abs(now - ts) > 300) {
    console.error('[Webhook] Timestamp too old or in the future');
    return false;
  }

  // Standard Webhooks: sign(msgId + "." + timestamp + "." + body)
  const signPayload = `${msgId}.${msgTimestamp}.${body}`;
  // Secret is base64-encoded, prefixed with "whsec_"
  const secretBytes = Buffer.from(
    WEBHOOK_SECRET.startsWith('whsec_') ? WEBHOOK_SECRET.slice(6) : WEBHOOK_SECRET,
    'base64'
  );
  const computed = createHmac('sha256', secretBytes).update(signPayload).digest('base64');
  const expectedSig = `v1,${computed}`;

  // webhook-signature can contain multiple signatures separated by spaces
  const signatures = msgSignature.split(' ');
  for (const sig of signatures) {
    try {
      if (timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
        return true;
      }
    } catch {
      // length mismatch, continue
    }
  }

  console.error('[Webhook] Signature verification failed');
  return false;
}

/**
 * PortOne V2 결제 웹훅 처리
 * https://developers.portone.io/opi/ko/integration/webhook/readme-v2
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    // 1. 서명 검증
    if (!verifyWebhookSignature(body, req.headers)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 1.5 리플레이 방지
    const msgId = req.headers.get('webhook-id');
    if (msgId && isReplay(msgId)) {
      console.log(`[Webhook] Duplicate msgId ignored: ${msgId}`);
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    // 2. V2 페이로드 파싱
    const payload = JSON.parse(body) as {
      type: string;
      timestamp: string;
      data: {
        storeId?: string;
        paymentId?: string;
        transactionId?: string;
        cancellationId?: string;
      };
    };

    console.log(`[Webhook] type=${payload.type}, paymentId=${payload.data.paymentId}`);

    const { paymentId } = payload.data;
    if (!paymentId) {
      return NextResponse.json({ success: true, message: 'No paymentId, skipped' });
    }

    // 3. PortOne V2 API로 결제 상태 직접 조회 (웹훅 데이터만 믿지 않음)
    const verifyRes = await fetch(
      `https://api.portone.io/v2/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: {
          'Authorization': `PortOne ${PORTONE_CONFIG.apiSecret}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!verifyRes.ok) {
      console.error('[Webhook] PortOne API verify failed:', await verifyRes.text());
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
    }

    const payment = await verifyRes.json();
    const orderId = payment.customData || payment.orderName;

    if (!orderId) {
      console.error('[Webhook] Cannot determine orderId from payment');
      return NextResponse.json({ error: 'No orderId' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      console.error(`[Webhook] Order not found: ${orderId}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 4. 결제 상태에 따라 처리
    if (payment.status === 'PAID' && order.paymentStatus !== 'PAID') {
      // 금액 검증
      const expectedTotal = order.totalAmount + order.shippingFee;
      if (payment.amount?.total !== expectedTotal) {
        console.error(`[Webhook] Amount mismatch: expected ${expectedTotal}, got ${payment.amount?.total}`);
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
      }

      await updateOrder(orderId, {
        paymentStatus: 'PAID',
        orderStatus: 'PAID',
        paymentId,
        updatedAt: new Date().toISOString(),
      });

      await sendOrderConfirmNotification(order);
      console.log(`[Webhook] Order ${orderId} confirmed`);

    } else if (payment.status === 'CANCELLED' || payment.status === 'PARTIAL_CANCELLED') {
      await updateOrder(orderId, {
        paymentStatus: 'CANCELLED',
        orderStatus: 'CANCELLED',
        updatedAt: new Date().toISOString(),
      });
      console.log(`[Webhook] Order ${orderId} cancelled`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Webhook] Processing failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
