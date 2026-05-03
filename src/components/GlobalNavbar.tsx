'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

// Navbar를 숨길 경로 prefix
const HIDDEN_PREFIXES = [
  '/admin',
  '/vendor',
  '/embed',
  '/editor',
  '/checkout',
  '/export-voucher',
  '/partner',
  '/toss',
];

export default function GlobalNavbar() {
  const pathname = usePathname();
  const hidden = HIDDEN_PREFIXES.some(p => pathname?.startsWith(p));
  if (hidden) return null;
  return <Navbar />;
}
