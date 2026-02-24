
import React from 'react';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams = await params;
  
  // Fetch product from API
  let product = null;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3300';
    const res = await fetch(`${baseUrl}/api/products/${resolvedParams.id}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success) {
      product = data.product;
    }
  } catch (error) {
    console.error('Error fetching product:', error);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-8">
            Shop &gt; {product.category} &gt; <span className="text-black font-medium">{product.name}</span>
        </div>
        
        <ProductDetailClient product={product} />
      </div>
    </div>
  );
}
