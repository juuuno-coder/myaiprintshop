'use client';

import dynamic from 'next/dynamic';

const GlobalNavbar = dynamic(() => import('./GlobalNavbar'), { ssr: false });

export default function GlobalNavbarWrapper() {
  return <GlobalNavbar />;
}
