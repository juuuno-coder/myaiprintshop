"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Heart, MessageCircle, Share2, Filter, Zap, Eye, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ShowcaseModal from "@/components/ShowcaseModal";

const tags = ["ALL", "사이버펑크", "수채화", "캐릭터", "풍경", "로고", "패턴"];

const MOCK_SHOWCASE = [
  {
    id: 1,
    title: "Neon City Vibes",
    author: "CyberArtist",
    image: "https://images.unsplash.com/photo-1636955860106-9eb84e578c3c?auto=format&fit=crop&q=80&w=800",
    likes: 124,
    views: 1205,
    tag: "사이버펑크"
  },
  {
    id: 2,
    title: "Morning Coffee",
    author: "LatteArt",
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=800",
    likes: 89,
    views: 450,
    tag: "수채화"
  },
  {
    id: 3,
    title: "Space Traveler",
    author: "StarWalker",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    likes: 256,
    views: 3100,
    tag: "캐릭터"
  },
  {
    id: 4,
    title: "Abstract Waves",
    author: "Modernist",
    image: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800",
    likes: 67,
    views: 230,
    tag: "패턴"
  },
  {
    id: 5,
    title: "Future Car",
    author: "GearHead",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800",
    likes: 156,
    views: 1102,
    tag: "사이버펑크"
  },
  {
    id: 6,
    title: "Zen Garden",
    author: "PeaceMind",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
    likes: 92,
    views: 560,
    tag: "풍경"
  },
];

export default function ShowcasePage() {
  const [activeTag, setActiveTag] = useState("ALL");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<typeof MOCK_SHOWCASE[0] | null>(null);

  const filteredItems = activeTag === "ALL" 
    ? MOCK_SHOWCASE 
    : MOCK_SHOWCASE.filter(item => item.tag === activeTag);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 pb-12 text-center px-4">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-4"
        >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Showcase</h1>
            <p className="text-gray-500 text-lg">
                다른 크리에이터들이 AI로 만든 놀라운 작품들을 감상하고 영감을 얻으세요.
            </p>
        </motion.div>
      </section>

      {/* Filter */}
      <section className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                  {tags.map((tag) => (
                      <button 
                        key={tag}
                        onClick={() => setActiveTag(tag)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                            activeTag === tag 
                            ? 'bg-black text-white shadow-lg' 
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                          {tag}
                      </button>
                  ))}
              </div>
              <button className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
                  <Filter className="w-4 h-4" /> 필터
              </button>
          </div>
      </section>

      {/* Gallery Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div 
            layout
            className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
        >
            <AnimatePresence>
                {filteredItems.map((item) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        key={item.id}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => setSelectedItem(item)}
                        className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-gray-100 cursor-pointer"
                    >
                        <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {/* Overlay */}
                        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex flex-col justify-end p-6 ${hoveredId === item.id ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-white font-bold text-lg">{item.title}</h3>
                                    <span className="text-[10px] bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded font-bold">
                                        {item.tag}
                                    </span>
                                </div>
                                <p className="text-white/80 text-sm mb-4">by {item.author}</p>
                                
                                <div className="flex items-center gap-4 text-white">
                                    <div className="flex items-center gap-1.5">
                                        <Heart className="w-4 h-4 fill-white/20" />
                                        <span className="text-xs font-bold">{item.likes}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="w-4 h-4" />
                                        <span className="text-xs font-bold">{item.views}</span>
                                    </div>
                                    <button className="ml-auto bg-white text-black p-2 rounded-full hover:bg-gray-100 transition-colors">
                                        <Zap className="w-4 h-4 fill-current" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>

        {filteredItems.length === 0 && (
            <div className="py-20 text-center">
                <p className="text-gray-400">해당 태그의 작품이 없습니다.</p>
            </div>
        )}

        <div className="mt-20 text-center">
            <Link 
                href="/create"
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
                <Zap className="w-5 h-5 fill-current" /> 나도 작품 올리기
            </Link>
        </div>
      </section>

      {/* Modal */}
      {selectedItem && (
        <ShowcaseModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
        />
      )}
    </main>
  );
}
