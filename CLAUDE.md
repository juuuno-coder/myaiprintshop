# GOODZZ (굿쯔) 프로젝트 개발 설정 파일

이 파일은 GOODZZ 관련 개발 작업을 할 때 AI 어시스턴트가 반드시 숙지해야 하는 핵심 규칙과 정보들을 담고 있습니다.

## 프로젝트 개요
- **브랜드명**: GOODZZ (굿쯔)
- **도메인**: goodzz.co.kr (구매 예정)
- **성격**: 소상공인/브랜드를 위한 AI 굿즈 제작 플랫폼
- **타겟**: 카페, 베이커리, 플라워샵, 팝업스토어, 핸드메이드 브랜드 사장님
- **슬로건**: "내 브랜드 굿즈, AI로 뚝딱"
- **포지셔닝**: AI 디자인 + 인쇄 원스톱, 소량 특화 (100장~)
- **패키지**: `@vibers/goodzz`
- **개발 서버**: `http://localhost:3300`

## 톤 & 매너 규칙
- "크리에이터", "아티스트" 사용 금지 → "사장님", "브랜드 운영자"
- "혁신적인", "최첨단 AI" 금지 → 결과 중심 표현 ("3분이면 완성")
- 과도한 영어 금지 ("커스터마이즈" → "맞춤 제작")
- 친근하고 실용적인 톤 유지

## 기존 기술 스택/파일 구조/개발 규칙은 유지
(Next.js 16, Firebase, PortOne, Gemini AI, Fabric.js, Tailwind CSS 등)


## 세션로그 기록 (필수)
- 모든 개발 대화의 주요 내용을 `session-logs/` 폴더에 기록할 것
- 파일명: `YYYY-MM-DD_한글제목.md` / 내용: 한글
- 세션 종료 시, 마일스톤 달성 시, **컨텍스트 압축 전**에 반드시 저장
- 상세 포맷은 상위 CLAUDE.md 참조

---

## 파일 스토리지 — NCP Object Storage ⚠️

> **`src/lib/s3-client.ts` 직접 수정 금지. 레거시 파일임.**
> **로컬 MinIO(docker-compose)는 개발 테스트 전용. 실제 업로드는 NCP wero-bucket으로.**

- 버킷: `wero-bucket` (NCP Object Storage)
- 환경변수: `NCP_ACCESS_KEY`, `NCP_SECRET_KEY`, `NCP_BUCKET_NAME=wero-bucket`
- 전체 가이드: `packages/storage/NCP_STORAGE_GUIDE.md`

```ts
// 서버 사이드 (API Route):
import { getPresignedUploadUrl, uploadBuffer } from '@vibers/storage/server';

// 클라이언트 사이드:
import { uploadFile } from '@vibers/storage/client';
```
