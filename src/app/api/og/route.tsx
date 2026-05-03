import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'AI로 만드는 나만의 굿즈';
  const desc = searchParams.get('desc') || '머그컵, 티셔츠, 에코백까지. 3분이면 완성.';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          padding: '72px 80px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 배경 도형 */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(255, 107, 74, 0.15)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-60px',
          left: '300px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 107, 74, 0.08)',
          display: 'flex',
        }} />

        {/* GOODZZ 로고 텍스트 */}
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '80px',
          fontSize: '36px',
          fontWeight: 900,
          color: '#FF6B4A',
          letterSpacing: '-1px',
          display: 'flex',
        }}>
          GOODZZ
        </div>

        {/* 타이틀 */}
        <div style={{
          fontSize: title.length > 20 ? '52px' : '64px',
          fontWeight: 900,
          color: '#ffffff',
          lineHeight: 1.1,
          marginBottom: '20px',
          maxWidth: '800px',
          display: 'flex',
          flexWrap: 'wrap',
        }}>
          {title}
        </div>

        {/* 설명 */}
        <div style={{
          fontSize: '28px',
          color: 'rgba(255,255,255,0.6)',
          fontWeight: 400,
          display: 'flex',
        }}>
          {desc}
        </div>

        {/* 하단 태그 */}
        <div style={{
          position: 'absolute',
          bottom: '60px',
          right: '80px',
          display: 'flex',
          gap: '12px',
        }}>
          {['AI 디자인', '소량 제작', '빠른 배송'].map(tag => (
            <div key={tag} style={{
              padding: '8px 20px',
              background: 'rgba(255,107,74,0.2)',
              border: '1px solid rgba(255,107,74,0.4)',
              borderRadius: '100px',
              color: '#FF6B4A',
              fontSize: '18px',
              fontWeight: 700,
              display: 'flex',
            }}>
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
