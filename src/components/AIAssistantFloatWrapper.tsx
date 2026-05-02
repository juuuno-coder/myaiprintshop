'use client';

import dynamic from 'next/dynamic';

const AIAssistantFloat = dynamic(() => import('./AIAssistantFloat'), { ssr: false });

export default function AIAssistantFloatWrapper() {
  return <AIAssistantFloat />;
}
