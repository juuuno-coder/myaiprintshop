/**
 * 알림 서비스 (카카오 알림톡 / SMS)
 * 실제 운영 시 Aligo, Solapi 등의 API 연동이 필요합니다.
 */

export interface NotificationPayload {
    userId?: string;
    phone: string;
    templateName: 'ORDER_CONFIRMED' | 'DESIGN_APPROVED' | 'SHIPPING_STARTED';
    variables: Record<string, string>;
}

export async function sendNotification(payload: NotificationPayload) {
    try {
        console.log(`[Notification Service] Sending ${payload.templateName} to ${payload.phone}`);
        console.log(`[Variables]`, payload.variables);

        // TODO: 실제 API 연동 (예: axios.post('https://api.solapi.com/...'))
        // 현재는 개발 모드로 성공 로그만 남깁니다.
        
        return { success: true, messageId: `msg_${Date.now()}` };
    } catch (error) {
        console.error('Notification failed:', error);
        return { success: false, error };
    }
}

/**
 * 주문 완료 알림 (고객용)
 */
export async function sendOrderConfirmNotification(order: any) {
    return sendNotification({
        phone: order.shippingInfo.phone,
        templateName: 'ORDER_CONFIRMED',
        variables: {
            orderId: order.id,
            productName: order.items[0]?.productName + (order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ''),
            totalAmount: `${(order.totalAmount + order.shippingFee).toLocaleString()}원`,
            userName: order.shippingInfo.name
        }
    });
}
