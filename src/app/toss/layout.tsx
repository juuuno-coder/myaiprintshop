import type { Metadata, Viewport } from 'next';
import TossLayout from '@/components/toss/TossLayout';

export const metadata: Metadata = {
  title: '굿쯔 | 토스',
  description: '굿즈 탐색부터 구매까지 — 토스에서 바로 시작하세요',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function TossRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TossLayout serviceName="굿쯔">{children}</TossLayout>;
}
