'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Edit3, 
  Trash2, 
  ShoppingCart, 
  Clock, 
  ChevronRight,
  Loader2,
  AlertCircle,
  Archive,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getUserDesigns, DesignDraft, deleteDesign } from '@/lib/designs';
import { getProductById } from '@/lib/products';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyDesignsPage() {
  const { user, loading: authLoading } = useAuth();
  const [designs, setDesigns] = useState<DesignDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    const fetchDesigns = async () => {
      if (user) {
        const data = await getUserDesigns(user.uid);
        setDesigns(data);
      }
      setLoading(false);
    };

    if (!authLoading) {
      if (!user) {
        router.push('/');
        return;
      }
      fetchDesigns();
    }
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    if (!confirm('나만의 소중한 디자인을 영구 삭제하시겠습니까?')) return;
    
    const success = await deleteDesign(id);
    if (success) {
      setDesigns(designs.filter(d => d.id !== id));
      toast.success('디자인이 삭제되었습니다.');
    }
  };

  const handleOrderDirect = async (design: DesignDraft) => {
    try {
      const product = await getProductById(design.productId);

      if (!product) {
        toast.error('상품 정보를 찾을 수 없습니다.');
        return;
      }

      addToCart({
        productId: design.productId,
        name: design.productName,
        price: product.price,
        thumbnail: design.previewUrl,
        quantity: 1,
        customDesignUrl: design.previewUrl,
        size: 'Standard',
        color: 'Standard'
      });
      
      toast.success('장바구니에 담겼습니다! 🛒', {
        description: '장바구니로 이동하여 주문을 완료하세요.',
        action: {
          label: '장바구니 이동',
          onClick: () => router.push('/cart')
        }
      });
    } catch (error) {
      toast.error('주문 처리 중 오류가 발생했습니다.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-primary-600 mb-6" size={48} />
        <p className="text-gray-400 font-medium tracking-widest uppercase text-[10px]">Loading Your Studio エ</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
          <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest mb-3">
                  <Archive size={12} /> My Design Archive
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                  나의 디자인 <span className="text-primary-600">스튜디오</span>
              </h1>
              <p className="text-gray-400 text-sm mt-2 max-w-md leading-relaxed">
                  에디터에서 저장한 나만의 창의적인 작업물입니다.<br />
                  언제든 다시 편집하거나 클릭 한 번으로 주문할 수 있습니다.
              </p>
          </div>
          <Link 
            href="/shop" 
            className="group relative px-8 py-4 bg-gray-900 text-white rounded-2xl text-sm font-black hover:bg-primary-600 transition-all duration-500 shadow-2xl flex items-center gap-3"
          >
              <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
              새로운 디자인 시작
          </Link>
          
          {/* Background Accent */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-200/20 blur-3xl rounded-full -z-10" />
      </div>

      <AnimatePresence mode="popLayout">
        {designs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 bg-white/50 backdrop-blur-md rounded-[3rem] border border-dashed border-gray-200 shadow-inner relative overflow-hidden"
          >
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
               <Zap className="text-gray-200" size={40} />
             </div>
             <p className="text-gray-900 font-bold text-xl tracking-tight">아직 저장된 디자인이 없네요!</p>
             <p className="text-gray-400 text-sm mt-2 mb-10 max-w-xs mx-auto">지금 바로 굿즈를 골라 세상에 하나뿐인 나만의 디자인을 시작해보세요.</p>
             <Link 
              href="/shop" 
              className="inline-flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-xl text-sm font-bold text-gray-700 hover:border-primary-600 hover:text-primary-600 transition-all shadow-sm"
             >
                상품 그리드 보러가기 →
             </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {designs.map((design, idx) => (
              <motion.div 
                key={design.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="group relative bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] transition-all duration-700 hover:-translate-y-2 flex flex-col"
              >
                 {/* Preview Section */}
                 <div className="aspect-[4/3] relative overflow-hidden bg-gray-50 m-2 rounded-[2rem] shadow-inner">
                    <Image 
                      src={design.previewUrl} 
                      className="object-cover transition-transform group-hover:scale-105 duration-1000 ease-out" 
                      alt="Design Preview" 
                      fill 
                      unoptimized 
                    />
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                       <Link 
                         href={`/editor/${design.productId}?draft=${design.id}`}
                         className="w-12 h-12 bg-white text-gray-900 rounded-full flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 shadow-xl"
                         title="편집하기"
                       >
                         <Edit3 size={18} />
                       </Link>
                       <button 
                          onClick={() => handleOrderDirect(design)}
                          className="w-12 h-12 bg-white text-gray-900 rounded-full flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75 shadow-xl"
                          title="바로 주문"
                       >
                         <ShoppingCart size={18} />
                       </button>
                       <button 
                          onClick={() => handleDelete(design.id)}
                          className="w-12 h-12 bg-white text-gray-900 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 delay-150 shadow-xl"
                          title="삭제"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-4 left-4 pointer-events-none">
                       <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[9px] font-black px-3 py-1.5 rounded-full shadow-sm tracking-widest uppercase border border-white/50">
                         Creative Studio
                       </span>
                    </div>
                 </div>
                 
                 {/* Content Section */}
                 <div className="p-7 pt-5">
                    <div className="flex justify-between items-start gap-4">
                       <div className="min-w-0">
                          <h3 className="font-black text-gray-900 text-lg truncate tracking-tight">{design.productName}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                             <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                <Clock size={12} className="text-gray-300" />
                                {new Date(design.updatedAt).toLocaleDateString()}
                             </div>
                             <div className="w-1 h-1 rounded-full bg-gray-200" />
                             <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">DRAFT_SAVED</span>
                          </div>
                       </div>
                       <button 
                          onClick={() => handleOrderDirect(design)}
                          className="shrink-0 p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-primary-50 hover:text-primary-600 transition-all group/btn"
                       >
                          <ShoppingCart size={20} className="group-hover/btn:scale-110 transition-transform" />
                       </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 mt-8">
                       <Link 
                         href={`/editor/${design.productId}?draft=${design.id}`}
                         className="flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary-600 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-gray-200"
                       >
                         Resume Edit <ChevronRight size={14} />
                       </Link>
                    </div>
                 </div>
                 
                 {/* Card Background Accent */}
                 <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-100/50 blur-[60px] rounded-full -z-10 group-hover:opacity-100 transition-opacity duration-1000" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
