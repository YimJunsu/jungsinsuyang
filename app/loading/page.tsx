'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const MSGS = [
  '잠시만 기다려주세요...',
  '서버에 연결 중...',
  '데이터를 불러오는 중...',
  '거의 다 됐어요...',
  '조금만 더...',
  '처리 중입니다...',
  '응답을 기다리는 중...',
  '아직 기다리는 중이신가요? 저도요.',
  '...라고 생각하시겠지만 아직 멀었습니다.',
  '이 페이지는 영원히 로딩됩니다.',
  '진짜로요.',
  '네.',
  '정말이에요.',
  '믿으세요.',
  '......',
];

const FAKE_PERCENT_STEPS = [0, 1, 3, 3, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5];

export default function LoadingPage() {
  const [msgIdx,  setMsgIdx]  = useState(0);
  const [pct,     setPct]     = useState(0);
  const [dots,    setDots]    = useState('');

  useEffect(() => {
    const msgT = setInterval(() =>
      setMsgIdx(i => (i + 1) % MSGS.length), 3400);
    const dotT = setInterval(() =>
      setDots(d => d.length >= 3 ? '' : d + '.'), 480);
    const pctT = setInterval(() =>
      setPct(p => FAKE_PERCENT_STEPS[Math.min(p, FAKE_PERCENT_STEPS.length - 1)]), 800);
    return () => { clearInterval(msgT); clearInterval(dotT); clearInterval(pctT); };
  }, []);

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh', background: '#080808' }}>
      <header
        className="flex items-center gap-3 px-4 shrink-0"
        style={{ height: 56, background: '#111', borderBottom: '1px solid #222' }}
      >
        <Link href="/"
          className="flex items-center justify-center rounded-xl"
          style={{ width: 36, height: 36, color: '#555' }}>
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <span className="text-base font-semibold" style={{ color: '#555' }}>⏳ 로딩 중...</span>
      </header>

      <div className="flex flex-col items-center justify-center flex-1 gap-6">
        {/* Spinner rings */}
        <div className="relative" style={{ width: 72, height: 72 }}>
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.05)',
            borderTop: '3px solid #444',
            animation: 'spin 1.2s linear infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 8,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.04)',
            borderBottom: '2px solid #333',
            animation: 'spin 0.8s linear infinite reverse',
          }} />
        </div>

        {/* Progress bar (stuck) */}
        <div style={{ width: 220, height: 3, background: '#1a1a1a', borderRadius: 99 }}>
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${pct}%`,
            background: 'linear-gradient(to right, #333, #555)',
            transition: 'width 0.8s ease',
          }} />
        </div>

        {/* Percent */}
        <p style={{ fontFamily: 'monospace', color: '#3a3a3a', fontSize: 13 }}>
          {pct}%{dots}
        </p>

        {/* Rotating message */}
        <p style={{ color: '#4a4a4a', fontSize: 14, maxWidth: 280, textAlign: 'center', minHeight: 20 }}>
          {MSGS[msgIdx]}
        </p>
      </div>
    </div>
  );
}
