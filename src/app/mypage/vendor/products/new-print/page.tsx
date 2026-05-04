'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Search, CheckCircle2, Loader2,
  Package, Printer, Tag, ImageIcon, AlertCircle, Store
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface WowProduct {
  prodno: number;
  prodname: string;
  pathname: string;
}

interface WowDetail {
  prodno: number;
  prodname: string;
  sizeinfo: SizeInfo[];
  colorinfo: ColorGroup[];
  paperinfo: PaperGroup[];
  prsjobinfo?: JobInfo[];
}

interface SizeInfo {
  sizeno: number;
  sizename: string;
  width?: number;
  height?: number;
  non_standard?: number;
}

interface ColorGroup {
  pagecd?: number;
  colorlist: { colorno: number; name?: string; colorname?: string }[];
}

interface PaperGroup {
  covercd?: number;
  paperlist: { paperno: number; papername: string }[];
}

interface JobInfo {
  jobno: number;
  name?: string;
  jobname?: string;
}

interface PriceResult {
  ordcost_bill: number;
  ordcost_sup: number;
  exitdate: number;
}

// ─── 헬퍼 ─────────────────────────────────────────────────────────────────────

async function getToken() {
  const { getAuth } = await import('firebase/auth');
  return (await getAuth().currentUser?.getIdToken()) ?? '';
}

async function authFetch(url: string, opts?: RequestInit) {
  const token = await getToken();
  return fetch(url, {
    ...opts,
    headers: { ...opts?.headers, Authorization: `Bearer ${token}` },
  });
}

const QUANTITIES = [50, 100, 200, 300, 500, 1000, 2000, 3000, 5000];

// ─── 메인 ─────────────────────────────────────────────────────────────────────

export default function NewPrintProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1:제품선택 2:옵션+가격 3:샵등록

  // Step 1
  const [wowList, setWowList] = useState<WowProduct[]>([]);
  const [wowSearch, setWowSearch] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [selectedWow, setSelectedWow] = useState<WowProduct | null>(null);

  // Step 2
  const [detail, setDetail] = useState<WowDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [qty, setQty] = useState(100);
  const [sizeno, setSizeno] = useState('');
  const [colorno, setColorno] = useState('');
  const [paperno, setPaperno] = useState('');
  const [jobno, setJobno] = useState('');
  const [price, setPrice] = useState<PriceResult | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 3
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [sellPrice, setSellPrice] = useState(0);
  const [thumbnail, setThumbnail] = useState('');
  const [saving, setSaving] = useState(false);

  // ── WowPress 목록 로드 ──────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      setListLoading(true);
      try {
        const res = await authFetch('/api/wow/products');
        const data = await res.json();
        setWowList(data.products ?? []);
      } catch {
        toast.error('WowPress 제품 목록을 불러올 수 없습니다');
      } finally {
        setListLoading(false);
      }
    })();
  }, []);

  // ── WowPress 제품 상세 로드 ─────────────────────────────────────────────────

  useEffect(() => {
    if (!selectedWow) return;
    setDetailLoading(true);
    setDetail(null);
    setSizeno('');
    setColorno('');
    setPaperno('');
    setJobno('');
    setPrice(null);
    authFetch(`/api/wow/products/${selectedWow.prodno}`)
      .then(r => r.json())
      .then(d => {
        setDetail(d.product ?? null);
        // jobno 자동 선택 (하나뿐이면)
        if (d.product?.prsjobinfo?.length === 1) {
          setJobno(String(d.product.prsjobinfo[0].jobno));
        }
      })
      .catch(() => toast.error('제품 상세 조회 실패'))
      .finally(() => setDetailLoading(false));
  }, [selectedWow]);

  // ── 실시간 가격 조회 ────────────────────────────────────────────────────────

  const fetchPrice = useCallback(() => {
    if (!selectedWow || !sizeno || !colorno || !paperno || !jobno) return;
    setPriceLoading(true);
    fetch('/api/wow/price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prodno: selectedWow.prodno,
        ordqty: String(qty),
        ordcnt: '1',
        ordtitle: '가격조회',
        prsjob: [{
          jobno: String(jobno),
          covercd: 0,
          sizeno: String(sizeno),
          paperno: String(paperno),
          colorno0: String(colorno),
        }],
        awkjob: [],
      }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setPrice(d.price);
          // 판매가 기본값: 원가 + 30% 마크업
          if (!sellPrice) setSellPrice(Math.ceil(d.price.ordcost_bill * 1.3 / 100) * 100);
        } else {
          setPrice(null);
          toast.error(`가격 조회 실패: ${d.error}`);
        }
      })
      .catch(() => { setPrice(null); })
      .finally(() => setPriceLoading(false));
  }, [selectedWow, sizeno, colorno, paperno, jobno, qty]);

  useEffect(() => {
    if (priceTimer.current) clearTimeout(priceTimer.current);
    priceTimer.current = setTimeout(fetchPrice, 400);
    return () => { if (priceTimer.current) clearTimeout(priceTimer.current); };
  }, [fetchPrice]);

  // ── Step 2 → Step 3 진입 시 기본값 세팅 ────────────────────────────────────

  function goToStep3() {
    if (!price) { toast.error('가격을 먼저 조회해주세요'); return; }
    if (!prodName) setProdName(selectedWow?.prodname ?? '');
    setStep(3);
  }

  // ── 상품 등록 ───────────────────────────────────────────────────────────────

  async function saveProduct() {
    if (!user || !selectedWow || !price) return;
    if (!prodName.trim()) { toast.error('상품명을 입력해주세요'); return; }
    if (sellPrice <= 0) { toast.error('판매가를 입력해주세요'); return; }

    setSaving(true);
    try {
      // 벤더 정보 조회
      const vRes = await fetch('/api/vendors');
      const vData = await vRes.json();
      const vendor = vData.vendors?.find((v: any) => v.ownerId === user.uid);
      if (!vendor) { toast.error('판매자 정보가 없습니다. 판매자 등록을 먼저 해주세요'); return; }

      const wowpressMapping = {
        prodno: selectedWow.prodno,
        prodname: selectedWow.prodname,
        jobno: String(jobno),
        sizeno: String(sizeno),
        colorno0: String(colorno),
        paperno: String(paperno),
        covercd: 0,
        awkjob: [],
      };

      const body = {
        name: prodName.trim(),
        description: prodDesc.trim() || `${selectedWow.prodname} (${qty}부)`,
        price: sellPrice,
        thumbnail: thumbnail || '/images/placeholder-product.jpg',
        images: thumbnail ? [thumbnail] : [],
        category: 'print',
        subcategory: 'wowpress',
        vendorId: vendor.id,
        vendorName: vendor.storeName ?? vendor.name,
        vendorType: 'marketplace',
        stock: 99999,
        isActive: true,
        reviewCount: 0,
        rating: 0,
        wowpressMapping,
        metadata: {
          source: 'wowpress',
          defaultQty: qty,
          costPrice: price.ordcost_bill,
          exitdate: price.exitdate,
          syncedAt: new Date().toISOString(),
        },
      };

      const token = await getToken();
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? '등록 실패');

      toast.success('상품이 내 샵에 등록됐어요!');
      router.push('/mypage/vendor/products');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // ─── 필터된 목록 ─────────────────────────────────────────────────────────────

  const filteredList = wowList.filter(p =>
    p.prodname.toLowerCase().includes(wowSearch.toLowerCase()) ||
    p.pathname.toLowerCase().includes(wowSearch.toLowerCase())
  );

  const colors = detail?.colorinfo?.flatMap(c => c.colorlist) ?? [];
  const papers = detail?.paperinfo?.flatMap(p => p.paperlist) ?? [];
  const jobs   = detail?.prsjobinfo ?? [];

  const canGoStep2 = !!selectedWow;
  const canGoStep3 = !!(sizeno && colorno && paperno && (jobno || jobs.length === 0) && price);

  // ─── 렌더 ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-gray-900">인쇄 상품 만들기</h1>
            <p className="text-xs text-gray-400">WowPress 인쇄소 직접 연동</p>
          </div>
          {/* 스텝 표시 */}
          <div className="ml-auto flex items-center gap-1.5">
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {s < step ? '✓' : s}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* ── STEP 1: WowPress 제품 선택 ──────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">어떤 제품을 팔고 싶으세요?</h2>
              <p className="text-sm text-gray-500 mt-1">와우프레스 인쇄 제품 중에서 선택하세요</p>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={wowSearch} onChange={e => setWowSearch(e.target.value)}
                placeholder="제품명 검색 (예: 명함, 스티커, 현수막)"
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>

            {listLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
            ) : (
              <div className="grid gap-2 max-h-[60vh] overflow-y-auto pr-1">
                {filteredList.map(p => (
                  <button key={p.prodno}
                    onClick={() => setSelectedWow(p)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all
                      ${selectedWow?.prodno === p.prodno
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'}`}>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Printer size={18} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{p.prodname}</div>
                      <div className="text-xs text-gray-400 truncate">{p.pathname}</div>
                    </div>
                    {selectedWow?.prodno === p.prodno && (
                      <CheckCircle2 size={18} className="text-blue-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
                {filteredList.length === 0 && (
                  <div className="text-center py-12 text-gray-400">검색 결과가 없어요</div>
                )}
              </div>
            )}

            <button onClick={() => { if (canGoStep2) setStep(2); }}
              disabled={!canGoStep2}
              className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
              다음 — 옵션 선택 <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── STEP 2: 옵션 선택 + 실시간 가격 ─────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">옵션을 선택하세요</h2>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-medium text-blue-600">{selectedWow?.prodname}</span> — 옵션에 따라 가격이 바뀝니다
              </p>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
            ) : detail ? (
              <div className="space-y-4">
                {/* 수량 */}
                <div className="bg-white rounded-xl border p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">수량</label>
                  <div className="flex flex-wrap gap-2">
                    {QUANTITIES.map(q => (
                      <button key={q} onClick={() => setQty(q)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                          ${qty === q ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                        {q.toLocaleString()}부
                      </button>
                    ))}
                  </div>
                </div>

                {/* 규격 */}
                {detail.sizeinfo?.length > 0 && (
                  <div className="bg-white rounded-xl border p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">규격</label>
                    <div className="flex flex-wrap gap-2">
                      {detail.sizeinfo.map(s => (
                        <button key={s.sizeno} onClick={() => setSizeno(String(s.sizeno))}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border
                            ${sizeno === String(s.sizeno) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                          {s.sizename}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 도수 */}
                {colors.length > 0 && (
                  <div className="bg-white rounded-xl border p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">도수 (인쇄 색상)</label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map(c => (
                        <button key={c.colorno} onClick={() => setColorno(String(c.colorno))}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border
                            ${colorno === String(c.colorno) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                          {c.name ?? c.colorname ?? `#${c.colorno}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 지질 */}
                {papers.length > 0 && (
                  <div className="bg-white rounded-xl border p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">지질 (용지)</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {papers.map(p => (
                        <button key={p.paperno} onClick={() => setPaperno(String(p.paperno))}
                          className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border text-left
                            ${paperno === String(p.paperno) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                          {p.papername}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 인쇄기 (2개 이상일 때만 선택) */}
                {jobs.length > 1 && (
                  <div className="bg-white rounded-xl border p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">인쇄기</label>
                    <div className="flex flex-wrap gap-2">
                      {jobs.map(j => (
                        <button key={j.jobno} onClick={() => setJobno(String(j.jobno))}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border
                            ${jobno === String(j.jobno) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                          {j.name ?? j.jobname ?? `#${j.jobno}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 가격 결과 */}
                <div className={`rounded-xl border-2 p-5 transition-all ${price ? 'border-blue-200 bg-blue-50' : 'border-dashed border-gray-200 bg-gray-50'}`}>
                  {priceLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 size={16} className="animate-spin" /> 가격 계산 중...
                    </div>
                  ) : price ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">원가 (부가세 포함)</span>
                        <span className="font-bold text-gray-900">{price.ordcost_bill.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>공급가</span>
                        <span>{price.ordcost_sup.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>예상 출고일</span>
                        <span>{price.exitdate ? new Date(price.exitdate * 1000 > 1e12 ? price.exitdate : price.exitdate * 1000).toLocaleDateString('ko') : '-'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-2">
                      위 옵션을 모두 선택하면 가격이 표시됩니다
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-500 py-8 justify-center">
                <AlertCircle size={18} /> 제품 정보를 불러올 수 없습니다
              </div>
            )}

            <button onClick={goToStep3} disabled={!canGoStep3}
              className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
              다음 — 샵에 등록하기 <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── STEP 3: 샵 등록 ──────────────────────────────────────────────── */}
        {step === 3 && price && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">내 샵에 등록할게요</h2>
              <p className="text-sm text-gray-500 mt-1">상품명과 판매가를 설정하면 바로 판매를 시작할 수 있어요</p>
            </div>

            {/* 원가 요약 */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between text-sm">
              <span className="text-blue-700 font-medium">{selectedWow?.prodname} · {qty.toLocaleString()}부</span>
              <span className="text-blue-900 font-bold">원가 {price.ordcost_bill.toLocaleString()}원</span>
            </div>

            <div className="bg-white rounded-xl border divide-y">
              {/* 상품명 */}
              <div className="p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Tag size={14} /> 상품명 <span className="text-red-500">*</span>
                </label>
                <input value={prodName} onChange={e => setProdName(e.target.value)}
                  placeholder={selectedWow?.prodname ?? '상품명 입력'}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* 설명 */}
              <div className="p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">상품 설명</label>
                <textarea value={prodDesc} onChange={e => setProdDesc(e.target.value)}
                  rows={3} placeholder="고객에게 보여줄 설명을 입력하세요"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              {/* 썸네일 */}
              <div className="p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <ImageIcon size={14} /> 썸네일 URL
                </label>
                <input value={thumbnail} onChange={e => setThumbnail(e.target.value)}
                  placeholder="https://... (비워두면 기본 이미지 사용)"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {thumbnail && (
                  <img src={thumbnail} alt="미리보기" className="mt-2 w-20 h-20 object-cover rounded-lg border" />
                )}
              </div>

              {/* 판매가 */}
              <div className="p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Store size={14} /> 판매가 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={sellPrice || ''}
                    onChange={e => setSellPrice(Number(e.target.value))}
                    placeholder="판매가 입력"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
                </div>
                {sellPrice > 0 && price && (
                  <div className="mt-2 flex gap-3 text-xs">
                    <span className="text-gray-500">
                      마진: <span className="font-semibold text-green-600">
                        {(sellPrice - price.ordcost_bill).toLocaleString()}원
                        ({Math.round((sellPrice - price.ordcost_bill) / price.ordcost_bill * 100)}%)
                      </span>
                    </span>
                    {/* 빠른 마크업 버튼 */}
                    {[10, 20, 30, 50].map(pct => (
                      <button key={pct}
                        onClick={() => setSellPrice(Math.ceil(price.ordcost_bill * (1 + pct / 100) / 100) * 100)}
                        className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors">
                        +{pct}%
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button onClick={saveProduct} disabled={saving || !prodName.trim() || sellPrice <= 0}
              className="w-full py-3.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              내 샵에 등록하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
