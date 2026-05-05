/**
 * WowPress Open API 클라이언트
 *
 * 인증: JWT (WOWPRESS_TOKEN, 1년 유효)
 * API 문서: https://wowpress.co.kr/api/document
 */

const API_BASE = process.env.WOWPRESS_API_URL ?? 'https://api.wowpress.co.kr';
const FILE_BASE = process.env.WOWPRESS_FILE_URL ?? 'https://file.wowpress.co.kr';
const TOKEN = process.env.WOWPRESS_TOKEN;

// ─── 공통 응답 타입 ───────────────────────────────────────────────────────────

export interface WowResponse<T = unknown> {
  resultCode: string;         // "200" | "400"
  token: string | null;
  reqPath: string | null;
  statusCode: string | null;
  resultMsg: string | null;
  errMsg: string | null;
  resultMap: T | null;
}

// ─── 도메인 타입 ─────────────────────────────────────────────────────────────

export interface WowProduct {
  prodno: number;
  name: string;       // API 실제 필드명 (prodname 아님)
  pathname: string;
  path_name: string;  // 전체 경로 (WOW2.0 > ...)
  useyn: 'Y' | 'N';
  pjoin: number;
  prdclass: string;   // "P"=인쇄, "S"=샘플/기타
  cdt: string;
}

export interface WowProductDetail {
  prodno: number;
  prodname: string;
  pjoin: number;
  unit: number;
  dlvygrpno: number;
  dlvyprepay: boolean;
  ordqty: unknown[];
  sizeinfo: unknown[];
  paperinfo: unknown[];
  colorinfo: unknown[];
  awkjobinfo: unknown[];
  prodaddinfo: unknown[];
  deliverinfo: unknown;
}

export interface WowPriceRequest {
  prodno: number;
  ordqty: string;       // 수량
  ordcnt: string;       // 건수
  ordtitle: string;
  prsjob: {
    jobno: string;
    covercd: number;
    sizeno: string;
    wsize?: string;
    hsize?: string;
    jobqty?: string;
    paperno: string;
    colorno0: string;
    colorno0add?: string;
    joboptmsg?: string;
  }[];
  awkjob: {
    jobno: string;
    covercd: number;
    jobqty?: string;
    joboptmsg?: string;
  }[];
}

export interface WowPriceResult {
  prodno: number;
  ordqty: number;
  ordcnt: number;
  exitdate: number;
  ordcost_price: number;
  ordcost_dc: number;
  ordcost_sup: number;
  ordcost_tax: number;
  ordcost_bill: number;
  prsjob: unknown[];
  awkjob: unknown[];
}

export interface WowOrderRequest {
  action: 'ord' | 'cal';
  ordreq: WowOrderItem[][];
  dcpointreq?: number;
  dlvymcd: string;
  dlvyfr: WowAddress;
  dlvyto: WowAddress;
}

export interface WowOrderItem {
  prodno: number;
  ordqty: string;
  ordcnt: string;
  ordtitle: string;
  ordbody?: string;
  ordkey: string;         // 중복 주문 방지용 — GOODZZ 주문 ID 사용
  jobpresetno?: string;
  prsjob: WowPriceRequest['prsjob'];
  awkjob: WowPriceRequest['awkjob'];
}

export interface WowAddress {
  name: string;
  tel: string;
  sd: string;             // 시도
  sgg: string;            // 시군구
  umd?: string;           // 읍면동
  addr1: string;
  addr2: string;
  zipcode?: string;
}

export interface WowOrderResult {
  action: string;
  status: string;
  errmsg: string | null;
  ordcost_bill: number;
  dlvcost_bill: number;
  cost_bill: number;
  ordinfo: { ordnum: string; [k: string]: unknown }[];
  dlvinfo: unknown[];
}

export interface WowOrderDetail {
  ordnum: string;
  ordstat: number;        // 코드표 참조
  jobstat: number;
  shipnum: string | null; // 송장번호
  dlvyno: number | null;  // 택배사 코드
  [key: string]: unknown;
}

// ─── 주문상태 한글 변환 ───────────────────────────────────────────────────────

export const WOW_ORDER_STATUS: Record<number, string> = {
  0: '입금대기', 1: '접수대기', 2: '대체입금',
  10: '접수진행', 12: '상담대기', 20: '생산진행',
  30: '생산완료', 70: '출고대기', 80: '출고완료',
  84: '배송중', 85: '배송완료', 90: '주문취소',
};

export const WOW_JOB_STATUS: Record<number, string> = {
  100: '접수대기', 109: '파일에러', 101: '접수완료',
  102: '업로드완료', 103: '조판완료', 104: '출력완료',
  105: '인쇄완료', 106: '출고완료', 114: '주문취소',
};

// ─── 클라이언트 ───────────────────────────────────────────────────────────────

export class WowPressClient {
  private readonly timeout = 15_000;

  private get headers() {
    if (!TOKEN) throw new Error('WOWPRESS_TOKEN 환경변수가 설정되지 않았습니다');
    return {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json;charset=UTF-8',
    };
  }

  private async request<T>(
    url: string,
    init: RequestInit = {}
  ): Promise<WowResponse<T>> {
    const res = await fetch(url, {
      ...init,
      headers: { ...this.headers, ...(init.headers ?? {}) },
      signal: AbortSignal.timeout(this.timeout),
    });

    const data: WowResponse<T> = await res.json();

    if (data.resultCode !== '200') {
      throw new Error(`WowPress API 오류 [${url}]: ${data.errMsg ?? data.resultMsg ?? data.resultCode}`);
    }

    return data;
  }

  // ── 회원정보 ──────────────────────────────────────────────────────────────

  async getMyInfo() {
    const res = await this.request<{ mpagMainMap: unknown }>(`${API_BASE}/api/v1/mpag/myinfo/view`);
    return res.resultMap;
  }

  // ── 제품 목록 / 상세 ──────────────────────────────────────────────────────

  async getProductList(): Promise<WowProduct[]> {
    const res = await this.request<{ prodlist: WowProduct[] }>(
      `${API_BASE}/api/v1/std/prodlist`
    );
    return res.resultMap?.prodlist ?? [];
  }

  async getProductDetail(prodno: number): Promise<WowProductDetail> {
    const res = await this.request<{ prod_info: WowProductDetail }>(
      `${API_BASE}/api/v1/std/prod_info/${prodno}`,
      { next: { revalidate: 3600 } } as RequestInit
    );
    const detail = res.resultMap?.prod_info;
    if (!detail) throw new Error(`제품 상세 없음: ${prodno}`);
    return detail;
  }

  // ── 가격 조회 ─────────────────────────────────────────────────────────────

  async getPrice(req: WowPriceRequest): Promise<WowPriceResult> {
    const res = await this.request<{ cjson_jobcost: WowPriceResult }>(
      `${API_BASE}/api/v1/ord/cjson_jobcost`,
      { method: 'POST', body: JSON.stringify(req) }
    );
    const result = res.resultMap?.cjson_jobcost;
    if (!result) throw new Error('가격 조회 결과 없음');
    return result;
  }

  // ── 주문 ──────────────────────────────────────────────────────────────────

  async placeOrder(req: WowOrderRequest): Promise<WowOrderResult> {
    const res = await this.request<{ cjson_order: WowOrderResult }>(
      `${API_BASE}/api/v1/ord/cjson_order`,
      { method: 'POST', body: JSON.stringify(req) }
    );
    const result = res.resultMap?.cjson_order;
    if (!result) throw new Error('주문 결과 없음');
    if (result.status !== '200') throw new Error(`주문 실패: ${result.errmsg}`);
    return result;
  }

  async cancelOrder(ordnum: string): Promise<void> {
    await this.request(
      `${API_BASE}/api/v1/ord/ord_cancel`,
      { method: 'POST', body: JSON.stringify({ ordnum }) }
    );
  }

  // ── 주문 조회 ─────────────────────────────────────────────────────────────

  async getOrderDetail(ordnum: string): Promise<WowOrderDetail> {
    const res = await this.request<WowOrderDetail>(
      `${API_BASE}/api/v1/ord/order/${ordnum}`
    );
    if (!res.resultMap) throw new Error(`주문 없음: ${ordnum}`);
    return res.resultMap;
  }

  async getOrderList(params: {
    stdt: string; eddt: string;
    validord?: 'Y' | 'N'; ordnum?: string; ordkey?: string;
    pageIndex?: number; recordCountPerPage?: number;
  }) {
    const res = await this.request<{ list: unknown[] }>(
      `${API_BASE}/api/v1/ord/ord_list`,
      { method: 'POST', body: JSON.stringify(params) }
    );
    return res.resultMap?.list ?? [];
  }

  // ── 파일 업로드 ───────────────────────────────────────────────────────────

  /** URL로 파일 업로드 (비동기, 콜백 지원) */
  async uploadFileFromUrl(params: {
    ordnum: string;
    filename: string;
    fileurl: string;
    returnUrl?: string;
  }): Promise<void> {
    const form = new FormData();
    form.append('ordnum', params.ordnum);
    form.append('filename', params.filename);
    form.append('fileurl', params.fileurl);
    if (params.returnUrl) form.append('returnUrl', params.returnUrl);

    const res = await fetch(`${FILE_BASE}/api/v1/file/uploadasyc`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}` },
      body: form,
      signal: AbortSignal.timeout(this.timeout),
    });

    const data: WowResponse = await res.json();
    if (data.resultCode !== '200') {
      throw new Error(`파일 업로드 실패: ${data.errMsg ?? data.resultCode}`);
    }
  }

  // ── 콜백 URL 등록 ─────────────────────────────────────────────────────────

  async registerCallbackUrl(callbackUrl: string): Promise<void> {
    const form = new URLSearchParams({ cbkurl: callbackUrl });
    const res = await fetch(`${API_BASE}/api/v1/mpag/cbkurl/update`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
      signal: AbortSignal.timeout(this.timeout),
    });
    const data: WowResponse = await res.json();
    if (data.resultCode !== '200') {
      throw new Error(`콜백 URL 등록 실패: ${data.errMsg}`);
    }
  }
}

// 싱글톤
let _client: WowPressClient | null = null;
export function getWowPressClient() {
  return (_client ??= new WowPressClient());
}
