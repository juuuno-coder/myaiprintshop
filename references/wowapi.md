# 와우프레스 OPEN API 레퍼런스

> version 0.0.1 | Last updated 2025-12-31 | 출처: https://wowpress.co.kr/api/document

---

## 목차
1. [인증 (Authentication)](#인증)
2. [공통 응답 포맷](#공통-응답-포맷)
3. [API 엔드포인트 목록](#api-엔드포인트-목록)
4. [주문 플로우](#주문-플로우)
5. [코드표](#코드표)
6. [결제 안내](#결제-안내)
7. [GOODZZ 연동 메모](#goodzz-연동-메모)

---

## 인증

### 방식
- JWT (Json Web Token), 1년 유효
- refresh token 없음 → 토큰 유출 주의
- 서버 기동 시 발급 후 전역변수로 사용 권장

### 토큰 발급
```
POST https://api.wowpress.co.kr/api/login/issue
Content-Type: application/json

{
  "authUid": "와우프레스_ID",
  "authPw": "비밀번호"
}
```
응답:
```json
{
  "resultCode": "200",
  "token": "eyJ0eXAiOiJKV1QiLC...",
  "resultMsg": "정상발급되었습니다."
}
```

### 요청 헤더 (모든 API 공통)
```
Authorization: Bearer {token}
Content-Type: application/json;charset=UTF-8
```

> ⚠️ 비밀번호 변경해도 기존 토큰은 유효기간 내 유효. 절대 외부 노출 금지.

---

## 공통 응답 포맷

| Key | Type | Description |
|-----|------|-------------|
| resultCode | string | 200: 성공, 400: 실패 |
| token | string | 인증 토큰 (optional) |
| reqPath | string | 요청 URI |
| statusCode | string | HTTP 상태코드 |
| errMsg | string | 에러 메시지 |
| resultMap | map | 실제 응답 데이터 |

---

## API 엔드포인트 목록

### Base URL
- API: `https://api.wowpress.co.kr`
- 파일업로드: `https://file.wowpress.co.kr`

---

### 회원 정보

#### 회원정보 조회
```
GET https://api.wowpress.co.kr/api/v1/mpag/myinfo/view
```
반환: 멤버십등급(`CostKD`), 포인트(`Point`), 잔고(`Balance`), 가상계좌 등

#### 주문상태 콜백 URL 등록
```
POST https://api.wowpress.co.kr/api/v1/mpag/cbkurl/update
form: cbkurl={URL}  (json 방식: cbkurl={URL}?type=json)
```

---

### 제품 정보

#### 제품목록 조회
```
GET https://api.wowpress.co.kr/api/v1/std/prodlist
```
반환: `prodno`, `pathname`, `useyn`(Y:주문가능/N:불가), `cdt`

> ⚠️ 판매중지 제품은 주문 불가 → 항상 `useyn` 체크

#### 제품 상세 (옵션/제약조건 포함)
```
GET https://api.wowpress.co.kr/api/v1/std/prod_info/{prodno}
```
반환: `sizeinfo`, `paperinfo`, `colorinfo`, `awkjobinfo`, `prodaddinfo`, `deliverinfo`

#### 제품별 개별 조회 API
| 엔드포인트 | 설명 | 주요 파라미터 |
|-----------|------|-------------|
| `GET /api/v1/std/prod` | 기본정보 | prodNo |
| `GET /api/v1/std/size` | 규격 | prodNo |
| `GET /api/v1/std/color` | 도수 | prodNo |
| `GET /api/v1/std/paper` | 지질 | prodNo, sizeNo |
| `GET /api/v1/std/qty` | 수량 | prodNo, sizeNo, colorNo, paperNo |
| `GET /api/v1/std/cnt` | 건수 | prodNo |
| `GET /api/v1/std/awk` | 후가공 | prodNo |
| `GET /api/v1/std/opt` | 옵션 | prodNo |
| `GET /api/v1/std/add` | 부자재 | prodNo |

---

### 가격 조회

#### 제품 가격 조회
```
POST https://api.wowpress.co.kr/api/v1/ord/cjson_jobcost
Content-Type: application/json

{
  "prodno": 12345,
  "ordqty": "100",
  "ordcnt": "1",
  "ordtitle": "주문제목",
  "prsjob": [{ "jobno": "...", "sizeno": "...", "paperno": "...", "colorno0": "..." }],
  "awkjob": []
}
```
반환: `ordcost_bill`(청구가), `ordcost_sup`(공급가), `ordcost_tax`(부가세), `exitdate`(출고예정일)

> 가격이 조회되지 않으면 주문 불가 옵션

#### 예상 배송비 조회 (선불택배)
```
POST https://api.wowpress.co.kr/api/v1/ord/cjson_dlvycost
(주문 파라미터와 동일)
```

---

### 주문

#### 주문하기
```
POST https://api.wowpress.co.kr/api/v1/ord/cjson_order
Content-Type: application/json

{
  "action": "ord",          // "ord":주문, "cal":계산만
  "ordreq": [[{
    "prodno": 12345,
    "ordqty": "100",
    "ordcnt": "1",
    "ordtitle": "주문제목",
    "ordbody": "메모",
    "ordkey": "사용자정의_중복방지키",
    "prsjob": [...],
    "awkjob": []
  }]],
  "dcpointreq": 0,          // 포인트 사용 (100단위)
  "dlvymcd": "4",           // 배송방법 코드
  "dlvyfr": { "name": "보내는분", "tel": "010-...", "sd": "부산시", "sgg": "해운대구", "umd": "좌동", "addr1": "주소", "addr2": "상세주소" },
  "dlvyto": { "name": "받는분", "tel": "010-...", "sd": "서울시", "sgg": "강남구", "umd": "역삼동", "addr1": "주소", "addr2": "상세주소" }
}
```
반환: `ordnum`(주문번호), `ordcost_bill`, `dlvcost_bill`, `cost_bill`

> ⚠️ `ordkey` 활용해 중복 주문 방지 필수

#### 주문 취소
```
POST https://api.wowpress.co.kr/api/v1/ord/ord_cancel
{ "ordnum": "WPABP..." }
```
취소 가능 상태: 입금대기(0), 접수대기(1), 파일에러만 가능

---

### 파일 업로드

#### 방법1: 직접 업로드
```
POST https://file.wowpress.co.kr/api/v1/file/upload
form-data: file(binary), ordnum
```

#### 방법2: URL로 업로드 (동기)
```
POST https://file.wowpress.co.kr/api/v1/file/uploadurl
form-data: ordnum, filename, fileurl
```

#### 방법3: URL로 업로드 (비동기 + 콜백)
```
POST https://file.wowpress.co.kr/api/v1/file/uploadasyc
form-data: ordnum, filename, fileurl, returnUrl(optional)
```
- 응답 즉시 반환 → 파일 다운로드 완료 후 `returnUrl`로 콜백
- `returnUrl`에 `{ordnum}` path variable 활용 가능: `https://goodzz.co.kr/api/wow/callback/{ordnum}`

> ⚠️ 파일 없으면 주문 접수 안 됨. 접수 후 파일 변경 불가(기존 파일로 생산)

---

### 주문 조회

#### 주문배송 목록 조회
```
POST https://api.wowpress.co.kr/api/v1/ord/ord_list
GET  https://api.wowpress.co.kr/api/v1/ord/ord_listq?pageIndex=1&ordnum=WPABP...

{
  "stdt": "2026-01-01",
  "eddt": "2026-12-31",
  "validord": "Y",     // Y: 취소 제외
  "pageIndex": 1,
  "recordCountPerPage": 10
}
```

#### 주문 상세
```
GET https://api.wowpress.co.kr/api/v1/ord/order/{ordnum}
```

#### 예상 출고일
```
GET https://api.wowpress.co.kr/api/v1/ord/dlvydate/{ordnum}
```

#### 제품 스펙 변경 공지
```
GET https://api.wowpress.co.kr/notice/spec?prodno=&pageIndex=1
```

---

### 묶음배송
```
POST https://api.wowpress.co.kr/api/v1/dlvy/bdle
{ "ordnum": "source주문번호", "dboxnum": "target배송박스번호" }
```

### API 카드결제 (빌링키)
```
POST https://api.wowpress.co.kr/api/v1/pay/billKey
{ "AmtReq": 50000, "UBNo": "홈페이지발급_빌키" }
```
> 홈페이지에서 카드 등록 후 사용 가능

---

## 주문 플로우

```
1. 제품목록 조회 (/std/prodlist) → useyn=Y 확인
2. 제품상세 조회 (/std/prod_info/{prodno}) → 옵션/제약조건 파악
3. 가격 조회 (/ord/cjson_jobcost) → ordcost_bill 확인
4. 주문 (/ord/cjson_order, action:"ord") → ordnum 발급
5. 파일 업로드 (/file/upload 또는 uploadurl)
6. 결제 (선입금 자동정산 or 빌링키 결제)
7. 주문상태 콜백 수신 (ordstat: 0→1→10→20→70→80)
8. 배송 추적 (/ord/order/{ordnum})
```

---

## 주문상태 콜백

주문 상태 변경 시 자동 POST 전송 (10초 간격, 최대 10회 재시도)

```json
{
  "cdt": "2026-05-03 12:00:00",
  "ordnum": "WPABP...",
  "ordstat": 20,
  "jobstat": 101,
  "shipnum": "송장번호",
  "cbkmsg": "{...}"
}
```

---

## 코드표

### 주문상태 (ordstat)
| 코드 | 상태 |
|------|------|
| 0 | 입금대기 |
| 1 | 접수대기 |
| 10 | 접수진행 |
| 20 | 생산진행 |
| 30 | 생산완료 |
| 70 | 출고대기 |
| 80 | 출고완료 |
| 90 | 주문취소 |

### 작업상태 (jobstat) 주요 코드
| 코드 | 상태 |
|------|------|
| 109 | 파일에러 |
| 120 | 견적수정 |
| 101 | 접수완료 |
| 106 | 출고완료 |
| 114 | 주문취소 |

### 배송방법 (dlvymcd)
| 코드 | 방법 |
|------|------|
| 0 | 방문 |
| 1 | 배쑝와쑝 |
| 2 | 대리배송 |
| 3 | 착불택배 |
| 4 | 선불택배 |
| 5 | 화물 |

### 주문 에러코드 (status)
| 코드 | 내용 |
|------|------|
| 401 | 필수 파라미터 누락 |
| 402 | 필수 후가공 체크 에러 |
| 404~415 | 규격/지질/도수/후가공 선택 오류 |
| 700~717 | 배송지 정보 오류 |
| 750~753 | 배송방법/지역 오류 |

---

## 결제 안내

- 주문 후 → **입금대기** 상태
- **선입금 잔액** 있으면 자동 정산
- 미정산 시 접수/생산 진행 안 됨
- 결제 방법: NicePay 카드결제, 간편결제(카카오/네이버), 전용계좌 이체, API 빌링키
- 포인트: `dcpointreq` (100원 단위, 보유량 이내)

---

## GOODZZ 연동 메모

### 연동 우선순위 (추천 순서)
1. **제품목록/상세** → GOODZZ 제품 카탈로그에 와우프레스 제품 매핑
2. **가격 조회** → AI 디자인 완성 후 실시간 견적 표시
3. **파일업로드 + 주문** → "주문하기" 버튼 1클릭으로 인쇄 발주
4. **콜백** → 주문 상태 실시간 업데이트
5. **빌링키 결제** → 자동 정산 (GOODZZ 결제 후 와우 자동 발주)

### 주요 환경변수 (추가 필요)
```env
WOWPRESS_API_URL=https://api.wowpress.co.kr
WOWPRESS_FILE_URL=https://file.wowpress.co.kr
WOWPRESS_TOKEN=eyJ0eXAiOiJKV1Qi...  # 1년마다 갱신
WOWPRESS_CALLBACK_SECRET=  # 콜백 검증용 (있으면)
```

### API 파일 위치 (예정)
- `src/lib/wowpress/client.ts` — JWT 발급 + 공통 fetch
- `src/lib/wowpress/products.ts` — 제품목록/상세/가격
- `src/lib/wowpress/orders.ts` — 주문/취소/상태조회
- `src/app/api/wow/callback/route.ts` — 주문상태 콜백 수신

### 주의사항
- **테스트 환경 없음** — 모든 API가 실운영 서버. 테스트 계정(wowapitest) 사용
- 중복 주문 방지: `ordkey`에 GOODZZ 내부 주문ID 사용
- 파일은 반드시 주문 직후 업로드 (없으면 접수 안 됨)
- 선불택배(4) 불가 제품 있음 (현수막, 배너 등) → `dlvyprepay` 체크
