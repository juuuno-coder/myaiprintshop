'use client';

import dynamic from 'next/dynamic';

const Scripts = dynamic(() => import('./ThirdPartyScriptsInner'), { ssr: false });

export default function ThirdPartyScripts() {
  return <Scripts />;
}
