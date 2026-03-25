import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// 사업계획서 데이터 저장 경로 (프로젝트 루트에 저장)
const DATA_FILE_PATH = path.join(process.cwd(), 'export-voucher-data.json');

// GET: 저장된 데이터 불러오기
export async function GET() {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    // 파일이 없으면 null 반환
    return NextResponse.json(null);
  }
}

// POST: 데이터 저장하기
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 저장 시간 추가
    const dataWithTimestamp = {
      ...data,
      _savedAt: new Date().toISOString(),
      _savedAtKorean: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
    };
    
    // JSON 파일로 저장 (들여쓰기로 보기 좋게)
    await fs.writeFile(
      DATA_FILE_PATH, 
      JSON.stringify(dataWithTimestamp, null, 2), 
      'utf-8'
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'AI 협업용 저장 완료!',
      savedAt: dataWithTimestamp._savedAtKorean
    });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save data' }, 
      { status: 500 }
    );
  }
}
