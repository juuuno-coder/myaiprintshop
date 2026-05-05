'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, Search, Link2, CheckCircle2, AlertCircle, Loader2, ChevronRight, X, RefreshCw, Printer, Percent, ClipboardList, RotateCcw } from 'lucide-react';

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface GoodzzProduct {
  id: string;
  name: string;
  price: number;
  thumbnail?: string;
  category?: string;
  isActive: boolean;
  wowpressMapping?: WowMapping;
}

interface WowMapping {
  prodno: number;
  prodname?: string;
  jobno: string;
  sizeno: string;
  colorno0: string;
  paperno: string;
  covercd?: number;
  awkjob?: { jobno: string }[];
}

interface WowProduct {
  prodno: number;
  prodname: string;
  pathname: string;
}

interface WowDetail {
  prodno: number;
  prodname: string;
  sizeinfo: { sizeno: number; sizename: string }[];
  colorinfo: { colorlist: { colorno: number; colorname?: string; name?: string }[]; pagecd?: number }[];
  paperinfo: { covercd?: number; paperlist: { paperno: number; papername: string }[] }[];
  prsjobinfo?: { jobno: number; jobname?: string; name?: string }[];
  awkjobinfo?: { jobgrouplist: { awkjoblist: { jobno: number; jobname: string }[] }[] }[];
}

// ─── 헬퍼 ─────────────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const { getAuth } = await import('firebase/auth');
  const token = await getAuth().currentUser?.getIdToken();
  return token ?? '';
}

async function authFetch(url: string, opts?: RequestInit) {
  const token = await getToken();
  return fetch(url, {
    ...opts,
    headers: { ...opts?.headers, Authorization: `Bearer ${token}` },
  });
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function WowPressManager() {
  const [products, setProducts] = useState<GoodzzProduct[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GoodzzProduct | null>(null);
  const [panel, setPanel] = useState(false);

  // 매핑 편집 상태
  const [prodno, setProdno] = useState('');
  const [wowDetail, setWowDetail] = useState<WowDetail | null>(null);
  const [wowLoading, setWowLoading] = useState(false);
  const [wowError, setWowError] = useState('');
  const [mapping, setMapping] = useState<Partial<WowMapping>>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // 탭
  const [activeTab, setActiveTab] = useState<'mapping' | 'orders'>('mapping');

  // 발주 현황
  const [orderLogs, setOrderLogs] = useState<any[]>([]);
  const [orderSummary, setOrderSummary] = useState<{ total: number; forwarded: number; failed: number; retried_success: number } | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState('');
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // 콜백 등록
  const [cbLoading, setCbLoading] = useState(false);
  const [cbMsg, setCbMsg] = useState('');

  // 전체 상품 동기화
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number; total: number; errors: string[] } | null>(null);

  // 마진율 설정
  const [marginInput, setMarginInput] = useState('115'); // 115 = 1.15배
  const [marginSaving, setMarginSaving] = useState(false);
  const [marginMsg, setMarginMsg] = useState('');
  const [currentMarginRate, setCurrentMarginRate] = useState(1.15);

  // GOODZZ 제품 목록 로드
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?limit=100&isActive=true');
      const data = await res.json();
      setProducts(data.products ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // 마진율 초기 로드
  useEffect(() => {
    authFetch('/api/admin/wow/settings')
      .then(r => r.json())
      .then(d => {
        if (d.settings?.globalMarginRate) {
          setCurrentMarginRate(d.settings.globalMarginRate);
          setMarginInput(String(Math.round(d.settings.globalMarginRate * 100)));
        }
      })
      .catch(() => {});
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // 제품 선택 → 패널 열기
  function openPanel(p: GoodzzProduct) {
    setSelected(p);
    setPanel(true);
    setWowDetail(null);
    setWowError('');
    setSaveMsg('');
    if (p.wowpressMapping) {
      setProdno(String(p.wowpressMapping.prodno));
      setMapping(p.wowpressMapping);
    } else {
      setProdno('');
      setMapping({});
    }
  }

  // WowPress 제품 조회
  async function fetchWowDetail() {
    if (!prodno.trim()) return;
    setWowLoading(true);
    setWowError('');
    setWowDetail(null);
    setMapping(prev => ({ ...prev, prodno: Number(prodno) }));
    try {
      const res = await authFetch(`/api/wow/products/${prodno}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setWowDetail(data.product);
    } catch (e) {
      setWowError((e as Error).message);
    } finally {
      setWowLoading(false);
    }
  }

  // 매핑 저장
  async function saveMapping() {
    if (!selected) return;
    const { prodno: p, jobno, sizeno, colorno0, paperno } = mapping;
    if (!p || !jobno || !sizeno || !colorno0 || !paperno) {
      setSaveMsg('모든 필드를 선택해주세요.');
      return;
    }
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await authFetch(`/api/products/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wowpressMapping: {
            prodno: p,
            prodname: wowDetail?.prodname,
            jobno: String(jobno),
            sizeno: String(sizeno),
            colorno0: String(colorno0),
            paperno: String(paperno),
            covercd: mapping.covercd ?? 0,
            awkjob: mapping.awkjob ?? [],
          },
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? '저장 실패');
      setSaveMsg('저장 완료');
      await loadProducts();
    } catch (e) {
      setSaveMsg(`오류: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  }

  // 전체 WowPress 상품 동기화
  async function syncAll() {
    setSyncLoading(true);
    setSyncResult(null);
    try {
      const res = await authFetch('/api/admin/wow/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncResult(data.result);
        await loadProducts();
      } else {
        setSyncResult({ synced: 0, total: 0, errors: [data.error ?? '동기화 실패'] });
      }
    } catch (e) {
      setSyncResult({ synced: 0, total: 0, errors: [(e as Error).message] });
    } finally {
      setSyncLoading(false);
    }
  }

  // 마진율 저장
  async function saveMargin() {
    const rate = Number(marginInput) / 100;
    if (rate < 1.0 || rate > 5.0) { setMarginMsg('100~500 사이 입력'); return; }
    setMarginSaving(true);
    setMarginMsg('');
    try {
      await authFetch('/api/admin/wow/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ globalMarginRate: rate }),
      });
      setCurrentMarginRate(rate);
      setMarginMsg(`저장 완료 (원가 × ${rate} 적용)`);
    } catch {
      setMarginMsg('저장 실패');
    } finally {
      setMarginSaving(false);
    }
  }

  // 콜백 URL 등록
  async function registerCallback() {
    setCbLoading(true);
    setCbMsg('');
    try {
      const res = await authFetch('/api/wow/register-callback', { method: 'POST' });
      const data = await res.json();
      setCbMsg(data.success ? data.message : data.error);
    } catch (e) {
      setCbMsg((e as Error).message);
    } finally {
      setCbLoading(false);
    }
  }

  // 발주 현황 로드
  const loadOrderLogs = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const url = orderFilter ? `/api/admin/wow/orders?status=${orderFilter}` : '/api/admin/wow/orders';
      const res = await authFetch(url);
      const data = await res.json();
      if (data.success) {
        setOrderLogs(data.logs);
        setOrderSummary(data.summary);
      }
    } finally {
      setOrdersLoading(false);
    }
  }, [orderFilter]);

  useEffect(() => {
    if (activeTab === 'orders') loadOrderLogs();
  }, [activeTab, loadOrderLogs]);

  // 단건 재시도
  async function retryOrder(logId: string) {
    setRetryingId(logId);
    try {
      const res = await authFetch('/api/admin/wow/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry', logId }),
      });
      const data = await res.json();
      if (data.success) {
        await loadOrderLogs();
      }
    } finally {
      setRetryingId(null);
    }
  }

  // ─── 렌더 ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* 탭 */}
      <div className="flex gap-1 border-b border-gray-200">
        {([
          { id: 'mapping', label: '제품 매핑', icon: <Printer size={14} /> },
          { id: 'orders', label: '발주 현황', icon: <ClipboardList size={14} /> },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}{tab.label}
            {tab.id === 'orders' && orderSummary?.failed ? (
              <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {orderSummary.failed}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ── 발주 현황 탭 ── */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* 요약 카드 */}
          {orderSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: '전체', value: orderSummary.total, color: 'bg-gray-50 text-gray-700' },
                { label: '발주완료', value: orderSummary.forwarded, color: 'bg-green-50 text-green-700' },
                { label: '실패', value: orderSummary.failed, color: 'bg-red-50 text-red-700' },
                { label: '재시도성공', value: orderSummary.retried_success, color: 'bg-blue-50 text-blue-700' },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
                  <div className="text-2xl font-black">{s.value}</div>
                  <div className="text-xs font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* 필터 + 새로고침 */}
          <div className="flex items-center gap-2">
            <select
              value={orderFilter}
              onChange={e => setOrderFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="forwarded">발주완료</option>
              <option value="failed">실패</option>
              <option value="retried_success">재시도성공</option>
            </select>
            <button
              onClick={loadOrderLogs}
              disabled={ordersLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {ordersLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              새로고침
            </button>
          </div>

          {/* 로그 목록 */}
          {ordersLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={24} /></div>
          ) : (
            <div className="space-y-2">
              {orderLogs.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">발주 내역이 없습니다</div>
              )}
              {orderLogs.map((log: any) => {
                const statusColor: Record<string, string> = {
                  forwarded: 'bg-green-100 text-green-700',
                  failed: 'bg-red-100 text-red-700',
                  retried_success: 'bg-blue-100 text-blue-700',
                };
                const statusLabel: Record<string, string> = {
                  forwarded: '발주완료',
                  failed: '실패',
                  retried_success: '재시도성공',
                };
                return (
                  <div key={log.id} className="flex items-center gap-3 p-3.5 bg-white border border-gray-100 rounded-xl text-sm">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${statusColor[log.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel[log.status] ?? log.status}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        GOODZZ: <span className="font-mono text-xs">{log.goodzz_order_id}</span>
                      </div>
                      {log.wow_ordnum && (
                        <div className="text-xs text-gray-500">WOW: {log.wow_ordnum}</div>
                      )}
                      {log.error && (
                        <div className="text-xs text-red-500 truncate">{log.error}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 shrink-0">
                      {log.createdAt?.seconds
                        ? new Date(log.createdAt.seconds * 1000).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </div>
                    {log.status === 'failed' && (
                      <button
                        onClick={() => retryOrder(log.id)}
                        disabled={retryingId === log.id}
                        className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {retryingId === log.id ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
                        재시도
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 제품 매핑 탭 ── */}
      {activeTab === 'mapping' && <>

      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Printer size={22} className="text-blue-600" />
            WowPress 제품 매핑
          </h2>
          <p className="text-sm text-gray-500 mt-1">GOODZZ 제품에 WowPress 인쇄 옵션을 연결합니다</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={syncAll}
            disabled={syncLoading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {syncLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {syncLoading ? '동기화 중...' : '전체 상품 동기화'}
          </button>
          <button
            onClick={registerCallback}
            disabled={cbLoading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {cbLoading ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
            콜백 URL 등록
          </button>
          {cbMsg && <span className="text-xs text-green-600">{cbMsg}</span>}
          {syncResult && (
            <span className={`text-xs font-medium ${syncResult.errors.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              동기화 완료: {syncResult.synced}/{syncResult.total}건
              {syncResult.errors.length > 0 && ` (오류 ${syncResult.errors.length}건)`}
            </span>
          )}
        </div>
      </div>

      {/* 전체 마진율 설정 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Percent size={16} className="text-blue-600" />
          <span className="text-sm font-bold text-blue-900">전체 마진율</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={100} max={500} step={1}
            value={marginInput}
            onChange={e => setMarginInput(e.target.value)}
            className="w-20 px-3 py-1.5 border-2 border-blue-300 rounded-lg text-sm font-bold text-center focus:border-blue-600 focus:outline-none"
          />
          <span className="text-sm text-blue-700">% (110 = 원가×1.1 = 10% 이익)</span>
        </div>
        <button
          onClick={saveMargin}
          disabled={marginSaving}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {marginSaving ? <Loader2 size={12} className="animate-spin" /> : null}
          저장
        </button>
        {marginMsg && <span className="text-xs text-blue-700">{marginMsg}</span>}
        <span className="text-xs text-blue-500 ml-auto">현재: 원가 × {currentMarginRate} ({Math.round((currentMarginRate - 1) * 100)}% 마진)</span>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="제품명 검색..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 제품 목록 */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-blue-500" size={28} />
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => openPanel(p)}
              className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all text-left"
            >
              {p.thumbnail ? (
                <img src={p.thumbnail} alt={p.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Package size={20} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{p.name}</div>
                <div className="text-sm text-gray-500">{p.price.toLocaleString()}원</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {p.wowpressMapping ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={12} />
                    매핑됨 #{p.wowpressMapping.prodno}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                    <AlertCircle size={12} />
                    미매핑
                  </span>
                )}
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">검색 결과가 없습니다</div>
          )}
        </div>
      )}

      {/* 매핑 패널 */}
      {panel && selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setPanel(false)} />
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl">
            {/* 패널 헤더 */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-semibold text-gray-900">WowPress 매핑 편집</h3>
              <button onClick={() => setPanel(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* 선택된 제품 */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                {selected.thumbnail ? (
                  <img src={selected.thumbnail} alt={selected.name} className="w-14 h-14 rounded-lg object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Package size={24} className="text-gray-400" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">{selected.name}</div>
                  <div className="text-sm text-gray-500">{selected.price.toLocaleString()}원</div>
                </div>
              </div>

              {/* WowPress prodno 조회 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WowPress 제품번호 (prodno)
                </label>
                <div className="flex gap-2">
                  <input
                    value={prodno}
                    onChange={e => setProdno(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchWowDetail()}
                    placeholder="예) 40196"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={fetchWowDetail}
                    disabled={wowLoading}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {wowLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                    조회
                  </button>
                </div>
                {wowError && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} /> {wowError}
                  </p>
                )}
              </div>

              {/* 옵션 선택 (조회 후) */}
              {wowDetail && (
                <div className="space-y-4 border border-blue-100 rounded-xl p-4 bg-blue-50/30">
                  <div className="font-medium text-blue-900 text-sm">
                    {wowDetail.prodname} (#{wowDetail.prodno})
                  </div>

                  {/* 규격 */}
                  {wowDetail.sizeinfo?.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">규격 (sizeno)</label>
                      <select
                        value={mapping.sizeno ?? ''}
                        onChange={e => setMapping(prev => ({ ...prev, sizeno: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">선택하세요</option>
                        {wowDetail.sizeinfo.map(s => (
                          <option key={s.sizeno} value={s.sizeno}>{s.sizename} (#{s.sizeno})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 도수 */}
                  {wowDetail.colorinfo?.length > 0 && (() => {
                    const colors = wowDetail.colorinfo.flatMap(c => c.colorlist ?? []);
                    return colors.length > 0 ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">도수 (colorno0)</label>
                        <select
                          value={mapping.colorno0 ?? ''}
                          onChange={e => setMapping(prev => ({ ...prev, colorno0: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">선택하세요</option>
                          {colors.map(c => (
                            <option key={c.colorno} value={c.colorno}>{c.name ?? c.colorname} (#{c.colorno})</option>
                          ))}
                        </select>
                      </div>
                    ) : null;
                  })()}

                  {/* 지질 */}
                  {wowDetail.paperinfo?.length > 0 && (() => {
                    const papers = wowDetail.paperinfo.flatMap(p => p.paperlist ?? []);
                    return papers.length > 0 ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">지질 (paperno)</label>
                        <select
                          value={mapping.paperno ?? ''}
                          onChange={e => setMapping(prev => ({ ...prev, paperno: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">선택하세요</option>
                          {papers.map(p => (
                            <option key={p.paperno} value={p.paperno}>{p.papername} (#{p.paperno})</option>
                          ))}
                        </select>
                      </div>
                    ) : null;
                  })()}

                  {/* 인쇄기 (jobno) */}
                  {wowDetail.prsjobinfo && wowDetail.prsjobinfo.length > 0 ? (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">인쇄기 (jobno)</label>
                      <select
                        value={mapping.jobno ?? ''}
                        onChange={e => setMapping(prev => ({ ...prev, jobno: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">선택하세요</option>
                        {wowDetail.prsjobinfo.map(j => (
                          <option key={j.jobno} value={j.jobno}>{j.name ?? j.jobname} (#{j.jobno})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    // prsjobinfo 없는 제품은 jobno 직접 입력
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">인쇄기 번호 (jobno)</label>
                      <input
                        value={mapping.jobno ?? ''}
                        onChange={e => setMapping(prev => ({ ...prev, jobno: e.target.value }))}
                        placeholder="제품상세 JSON에서 jobno 확인"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* 후가공 (선택) */}
                  {wowDetail.awkjobinfo && wowDetail.awkjobinfo.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">후가공 (선택)</label>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {wowDetail.awkjobinfo.flatMap(a => a.jobgrouplist ?? []).flatMap(g => g.awkjoblist ?? []).map(j => {
                          const checked = mapping.awkjob?.some(a => a.jobno === String(j.jobno));
                          return (
                            <label key={j.jobno} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!checked}
                                onChange={e => {
                                  setMapping(prev => {
                                    const list = prev.awkjob ?? [];
                                    if (e.target.checked) return { ...prev, awkjob: [...list, { jobno: String(j.jobno) }] };
                                    return { ...prev, awkjob: list.filter(a => a.jobno !== String(j.jobno)) };
                                  });
                                }}
                                className="rounded"
                              />
                              {j.jobname} (#{j.jobno})
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 저장 버튼 */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={saveMapping}
                  disabled={saving || !wowDetail}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  매핑 저장
                </button>
                {saveMsg && (
                  <p className={`text-sm text-center ${saveMsg.startsWith('오류') ? 'text-red-500' : 'text-green-600'}`}>
                    {saveMsg}
                  </p>
                )}
              </div>

              {/* 기존 매핑 정보 */}
              {selected.wowpressMapping && (
                <div className="border-t pt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">현재 저장된 매핑</p>
                  <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto text-gray-600">
                    {JSON.stringify(selected.wowpressMapping, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </> /* end mapping tab */}
    </div>
  );
}
