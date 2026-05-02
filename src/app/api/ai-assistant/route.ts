import { GoogleGenerativeAI, FunctionCallingMode } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// AI 어시스턴트 도구 정의
const tools = [
  {
    functionDeclarations: [
      {
        name: 'search_products',
        description: '굿즈 상품을 검색하거나 카테고리별로 조회합니다. 사용자가 특정 상품을 찾거나 추천을 원할 때 사용합니다.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '검색어 (예: 머그컵, 티셔츠, 에코백)' },
            category: { type: 'string', description: '카테고리 (예: apparel, mug, bag, phone-case, sticker)' },
            limit: { type: 'number', description: '결과 수 (기본 6)' },
          },
        },
      },
      {
        name: 'generate_design',
        description: '사용자의 아이디어나 업종 설명을 바탕으로 AI 디자인 이미지를 생성합니다.',
        parameters: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: '디자인 아이디어 설명 (한국어 가능)' },
            style: { type: 'string', description: '스타일 (minimalist, vintage, modern, cute, professional 중 택1)' },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'analyze_brand',
        description: '사용자가 운영하는 브랜드/업종을 분석해서 어울리는 굿즈와 디자인 방향을 제안합니다.',
        parameters: {
          type: 'object',
          properties: {
            businessType: { type: 'string', description: '업종 (예: 카페, 베이커리, 플라워샵, 의류, 음식점)' },
            brandKeywords: { type: 'string', description: '브랜드 분위기 키워드 (예: 모던, 따뜻한, 귀여운)' },
          },
          required: ['businessType'],
        },
      },
      {
        name: 'write_product_description',
        description: '상품 판매 설명문을 작성합니다. 벤더가 상품 등록 시 사용합니다.',
        parameters: {
          type: 'object',
          properties: {
            productName: { type: 'string', description: '상품명' },
            keywords: { type: 'string', description: '상품 특징 키워드' },
            targetAudience: { type: 'string', description: '타겟 고객층' },
          },
          required: ['productName'],
        },
      },
    ],
  },
];

// 도구 실행 함수들
async function executeTool(name: string, args: Record<string, any>): Promise<string> {
  switch (name) {
    case 'search_products': {
      try {
        const params = new URLSearchParams();
        if (args.query) params.set('search', args.query);
        if (args.category) params.set('category', args.category);
        params.set('limit', String(args.limit || 6));

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://goodzz.vercel.app';
        const res = await fetch(`${baseUrl}/api/products?${params}`);
        const data = await res.json();
        const products = (data.products || data || []).slice(0, 6);

        if (!products.length) return '검색된 상품이 없습니다.';

        const list = products.map((p: any) =>
          `• [${p.name}] ${p.price?.toLocaleString()}원 | ID: ${p.id} | ${p.category}`
        ).join('\n');

        return `검색 결과 ${products.length}개:\n${list}`;
      } catch {
        return '상품 검색 중 오류가 발생했습니다.';
      }
    }

    case 'generate_design': {
      return JSON.stringify({
        action: 'generate_design',
        prompt: args.prompt,
        style: args.style || 'minimalist',
      });
    }

    case 'analyze_brand': {
      const recommendations: Record<string, string[]> = {
        카페: ['머그컵', '텀블러', '에코백', '앞치마', '스티커'],
        베이커리: ['앞치마', '에코백', '스티커', '포장지', '머그컵'],
        플라워샵: ['에코백', '앞치마', '스티커', '포스터'],
        의류: ['쇼핑백', '태그', '스티커', '포장지'],
        음식점: ['앞치마', '머그컵', '스티커', '포스터'],
      };

      const matched = Object.entries(recommendations).find(([key]) =>
        args.businessType.includes(key)
      );
      const items = matched ? matched[1] : ['머그컵', '에코백', '스티커', '티셔츠'];

      return `${args.businessType} 브랜드 분석 완료!\n추천 굿즈: ${items.join(', ')}\n분위기: ${args.brandKeywords || '브랜드에 맞게 제안'}\n다음 단계로 디자인을 생성하거나 상품을 바로 검색해드릴게요.`;
    }

    case 'write_product_description': {
      const { productName, keywords, targetAudience } = args;
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `다음 상품에 대한 온라인 쇼핑몰 판매 설명문을 작성해주세요.
상품명: ${productName}
특징: ${keywords || '없음'}
타겟: ${targetAudience || '일반 고객'}

조건:
- 200자 내외
- 친근하고 매력적인 톤
- 핵심 특징 3가지 포함
- 구매 욕구를 자극하는 문구로 마무리`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    }

    default:
      return '알 수 없는 도구입니다.';
  }
}

const SYSTEM_PROMPT = `당신은 GOODZZ(굿쯔)의 AI 굿즈 어시스턴트입니다.

GOODZZ는 소상공인과 브랜드를 위한 AI 굿즈 제작 플랫폼입니다.
- 머그컵, 티셔츠, 에코백, 폰케이스, 스티커 등 다양한 굿즈 제작 가능
- AI로 디자인 자동 생성 및 합성
- 소량(100개~)부터 주문 가능

역할:
1. 고객의 업종/브랜드를 파악해서 어울리는 굿즈 추천
2. 이미지나 아이디어로 AI 디자인 생성
3. 상품 검색 및 장바구니 안내
4. 벤더(판매자)를 위한 상품 설명문 작성

규칙:
- 항상 한국어로 답변
- 친절하고 실용적인 톤 (토스 스타일)
- 불필요한 미사여구 없이 핵심만
- 이모지 사용 금지
- 도구를 적극 활용해서 구체적인 결과 제공`;

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: '메시지가 올바르지 않습니다.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      tools,
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },
      systemInstruction: SYSTEM_PROMPT + (context ? `\n\n현재 페이지 컨텍스트: ${context}` : ''),
    });

    // 히스토리 변환 (마지막 메시지 제외)
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    const chat = model.startChat({ history });

    // 스트리밍 응답
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let result = await chat.sendMessage(lastMessage.content);
          let response = result.response;

          // 함수 호출 처리 루프
          while (response.functionCalls()?.length) {
            const calls = response.functionCalls()!;
            const toolResults = await Promise.all(
              calls.map(async (call) => ({
                functionResponse: {
                  name: call.name,
                  response: { result: await executeTool(call.name, call.args as Record<string, any>) },
                },
              }))
            );

            // 도구 결과 중 generate_design 액션이 있으면 클라이언트에 전송
            for (const tr of toolResults) {
              const res = tr.functionResponse.response.result;
              try {
                const parsed = JSON.parse(res);
                if (parsed.action === 'generate_design') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'action', ...parsed })}\n\n`));
                }
              } catch {}
            }

            result = await chat.sendMessage(toolResults);
            response = result.response;
          }

          const text = response.text();

          // 텍스트를 청크로 스트리밍
          const words = text.split('');
          const chunkSize = 10;
          for (let i = 0; i < words.length; i += chunkSize) {
            const chunk = words.slice(i, i + chunkSize).join('');
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`));
            await new Promise(r => setTimeout(r, 10));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`));
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[AI Assistant]', error);
    return NextResponse.json({ error: 'AI 어시스턴트에 연결할 수 없습니다.' }, { status: 500 });
  }
}
