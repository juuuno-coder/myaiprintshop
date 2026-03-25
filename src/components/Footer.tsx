'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand & Contact */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-linear-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-white">마이AI프린트샵</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              AI 디자이너와 함께 만드는 나만의 특별한 굿즈. 
              아이디어만 있으면 제작부터 배송까지 모든 것을 처리합니다.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-white">고객센터: 010-4866-5805</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>평일 09:00 - 18:00 / 점심 12:00 - 13:00</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>batakspot@naver.com</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">바로가기</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" className="hover:text-emerald-400 transition-colors">전체 상품</Link>
              </li>
              <li>
                <Link href="/shop?category=goods" className="hover:text-emerald-400 transition-colors">굿즈/팬시</Link>
              </li>
              <li>
                <Link href="/shop?category=fashion" className="hover:text-emerald-400 transition-colors">패션/어패럴</Link>
              </li>
              <li>
                <Link href="/shop?category=print" className="hover:text-emerald-400 transition-colors">인쇄</Link>
              </li>
              <li>
                <Link href="/create" className="hover:text-emerald-400 transition-colors">AI 디자이너</Link>
              </li>
            </ul>
          </div>
          
          {/* Info Links */}
          <div>
            <h4 className="text-white font-bold mb-4">고객지원</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="hover:text-emerald-400 transition-colors">자주 묻는 질문</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors">이용약관</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-400 transition-colors">개인정보처리방침</Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-emerald-400 transition-colors">배송/환불 안내</Link>
              </li>
            </ul>
            
            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div className="text-center md:text-left">
              <p>사업자: 부산 | 대표자: 김준형 | 사업자등록번호: 545-16-01046</p>
              <p>통신판매업신고번호: 2025-경남양산-0846호</p>
              <p>주소: 부산광역시 수영구 수영로 47 2층</p>
            </div>
            <p className="text-gray-600">
              © 2026 마이AI프린트샵. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
