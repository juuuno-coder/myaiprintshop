export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Footer from '@/components/Footer';
import CreateClientContent from '@/components/CreateClientContent';

export default async function CreatePage() {
  const products: any[] = [];

  return (
    <main className="min-h-[100dvh]">
      <CreateClientContent products={products} />
      <Footer />
    </main>
  );
}
