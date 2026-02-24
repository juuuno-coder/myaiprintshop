'use client';

import React, { useState } from 'react';
import styles from './AdminComponents.module.css';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [portoneId, setPortoneId] = useState('imp802931****');
  const [apiKey, setApiKey] = useState('14920193****');
  const [shippingFee, setShippingFee] = useState(3000);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(50000);
  const [aiApiKey, setAiApiKey] = useState('sk-******************');

  const handleSave = () => {
    // 실제로는 API로 저장
    toast.success('설정이 저장되었습니다!');
  };

  return (
    <div className={styles.componentContainer}>
      <h2 className={styles.title}>시스템 설정</h2>

      <div className={styles.settingSection}>
        <h3>결제 연동 (포트원)</h3>
        <p className={styles.sectionDesc}>
          전자 결제를 위한 포트원(아임포트) API 키를 설정합니다.
        </p>
        
        <div className={styles.formGroup}>
          <label>Merchant ID (가맹점 식별코드)</label>
          <input 
            type="text" 
            value={portoneId} 
            onChange={(e) => setPortoneId(e.target.value)} 
            className={styles.input}
            placeholder="imp00000000"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>REST API Key</label>
          <input 
            type="password" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.settingSection}>
        <h3>AI 서비스 연동</h3>
        <p className={styles.sectionDesc}>
          Gemini API (Google AI Studio) 이미지 생성 키를 설정합니다.
        </p>
        
        <div className={styles.formGroup}>
          <label>AI API Key</label>
          <input 
            type="password" 
            value={aiApiKey} 
            onChange={(e) => setAiApiKey(e.target.value)} 
            className={styles.input}
            placeholder="sk-..."
          />
        </div>
      </div>

      <div className={styles.settingSection}>
        <h3>스토어 설정</h3>
        <div className={styles.formGroup}>
          <label>기본 배송비 (KRW)</label>
          <input 
            type="number" 
            value={shippingFee} 
            onChange={(e) => setShippingFee(Number(e.target.value))} 
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>무료배송 기준 금액 (KRW)</label>
          <input 
            type="number" 
            value={freeShippingThreshold} 
            onChange={(e) => setFreeShippingThreshold(Number(e.target.value))} 
            className={styles.input}
          />
        </div>
      </div>

      <div>
        <button className={styles.saveBtn} onClick={handleSave}>
          변경사항 저장
        </button>
      </div>
    </div>
  );
}
