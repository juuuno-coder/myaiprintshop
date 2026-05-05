import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface WowSettings {
  globalMarginRate: number; // 예: 1.15 = 15% 마진
  updatedAt: string;
}

const DEFAULT_MARGIN = 1.15;

let _cache: { data: WowSettings; ts: number } | null = null;
const CACHE_TTL = 60_000; // 1분

export async function getWowSettings(): Promise<WowSettings> {
  if (_cache && Date.now() - _cache.ts < CACHE_TTL) return _cache.data;

  try {
    const snap = await getDoc(doc(db, 'settings', 'wow'));
    const data: WowSettings = snap.exists()
      ? (snap.data() as WowSettings)
      : { globalMarginRate: DEFAULT_MARGIN, updatedAt: new Date().toISOString() };
    _cache = { data, ts: Date.now() };
    return data;
  } catch {
    return { globalMarginRate: DEFAULT_MARGIN, updatedAt: new Date().toISOString() };
  }
}

export async function saveWowSettings(settings: Partial<WowSettings>): Promise<void> {
  await setDoc(
    doc(db, 'settings', 'wow'),
    { ...settings, updatedAt: new Date().toISOString() },
    { merge: true }
  );
  _cache = null; // 캐시 무효화
}

export function applyMargin(costPrice: number, marginRate: number): number {
  return Math.ceil(costPrice * marginRate);
}
