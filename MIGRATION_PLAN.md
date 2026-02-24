# 🚀 오션해양테크 → MY AI PRINT SHOP 이식 프로젝트

## 📋 프로젝트 개요

오션해양테크(rminu) 프로젝트의 검증된 기능들을 MY AI PRINT SHOP에 이식하여,
중소기업 쇼핑몰로서 필요한 핵심 기능들을 빠르게 구축합니다.

---

## ✅ 이식 대상 기능

### Phase 1: 관리자 페이지 시스템 ⭐ 완료

| 기능                      | 원본 위치                                      | 이식 상태      |
| ------------------------- | ---------------------------------------------- | -------------- |
| 관리자 대시보드 레이아웃  | `/app/admin/page.tsx`                          | ✅ 완료        |
| 주문 관리 (OrderManager)  | `/components/admin/OrderManager.tsx`           | ✅ 완료        |
| 회원 관리 (MemberManager) | `/components/admin/MemberManager.tsx`          | ⏭️ 스킵 (추후) |
| 배너 관리 (BannerManager) | `/components/admin/BannerManager.tsx`          | ✅ 완료        |
| 설정 (AdminSettings)      | `/components/admin/AdminSettings.tsx`          | ✅ 완료        |
| 관리자 스타일시트         | `/components/admin/AdminComponents.module.css` | ✅ 완료        |
| 관리자 페이지 스타일      | `/app/admin/admin.module.css`                  | ✅ 완료        |

**핵심 수정 사항:**

- 다국어 컨텍스트 → 간소화 (한국어 우선)
- AuthContext → 기존 인증 시스템에 맞게 수정
- Mock 데이터 → MY AI PRINT SHOP 데이터 구조에 맞게 수정

---

### Phase 2: 쇼핑몰 상세 페이지 강화

| 기능               | 원본 위치                           | 이식 상태 |
| ------------------ | ----------------------------------- | --------- |
| 리뷰 시스템        | `/components/Reviews.tsx`           | ⬜ 대기   |
| 리뷰 스타일        | `/components/Reviews.module.css`    | ⬜ 대기   |
| Q&A 시스템         | `/components/ProductQnA.tsx`        | ⬜ 대기   |
| Q&A 스타일         | `/components/ProductQnA.module.css` | ⬜ 대기   |
| 상품 정책          | `/components/ProductPolicy.tsx`     | ⬜ 대기   |
| 스티키 주문바 참고 | `/components/StickyOrderBar.tsx`    | ⬜ 참고만 |

**핵심 수정 사항:**

- 리뷰 데이터 → Mock에서 AI 굿즈 관련 리뷰로 변경
- 브랜딩 컬러 조정

---

### Phase 3: 수출바우처 사업계획서 시스템

| 기능              | 원본 위치                                                    | 이식 상태 |
| ----------------- | ------------------------------------------------------------ | --------- |
| 사업계획서 페이지 | `/app/export-voucher/business-plan/page.tsx`                 | ⬜ 대기   |
| 사업계획서 스타일 | `/app/export-voucher/business-plan/business-plan.module.css` | ⬜ 대기   |
| 저장 API          | `/app/api/export-voucher/save/route.ts`                      | ⬜ 대기   |

**핵심 수정 사항:**

- 기업 정보 → MY AI PRINT SHOP 정보로 변경
- 제품 정보 → AI 프린팅 굿즈로 변경

---

## 🔧 기술 스택 호환성

| 구분       | 오션해양테크 | MY AI PRINT SHOP | 호환성       |
| ---------- | ------------ | ---------------- | ------------ |
| 프레임워크 | Next.js 14   | Next.js          | ✅           |
| 스타일링   | CSS Modules  | Tailwind + CSS   | ⚠️ 조정 필요 |
| 상태관리   | Context      | Zustand          | ⚠️ 조정 필요 |
| 인증       | Firebase     | 미정             | ⚠️ 조정 필요 |

---

## 📅 진행 일정

1. **Phase 1**: 관리자 페이지 (예상 소요: 2-3시간)
2. **Phase 2**: 쇼핑몰 컴포넌트 (예상 소요: 1-2시간)
3. **Phase 3**: 수출바우처 (예상 소요: 1시간)

---

## 📁 폴더 구조 (이식 후)

```
src/
├── app/
│   ├── admin/                    # 🆕 관리자 페이지
│   │   ├── page.tsx
│   │   └── admin.module.css
│   ├── export-voucher/           # 🆕 수출바우처
│   │   └── business-plan/
│   └── shop/
│       └── [id]/
│           └── page.tsx          # 리뷰, Q&A 추가
├── components/
│   ├── admin/                    # 🆕 관리자 컴포넌트
│   │   ├── OrderManager.tsx
│   │   ├── MemberManager.tsx
│   │   ├── BannerManager.tsx
│   │   ├── AdminSettings.tsx
│   │   └── AdminComponents.module.css
│   ├── Reviews.tsx               # 🆕 리뷰 시스템
│   ├── ProductQnA.tsx            # 🆕 Q&A 시스템
│   └── ...existing components
```

---

**시작 일시**: 2026-01-09 13:09 (KST)
**담당**: AI Assistant (Antigravity)
