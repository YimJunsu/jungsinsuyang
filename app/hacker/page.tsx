'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

/* ─── Matrix characters ───── */
const CHARS = '0123456789ABCDEF><|\\!@#$%^&*アイウエオ카키쿠케코';

interface MatrixCol { x: number; y: number; speed: number; len: number; }

/* ─── 시나리오 데이터 (하나의 긴 문자열로 통합) ─── */
const HACK_SCENARIO = `
> nmap -sV --script vuln 10.0.0.1
Starting Nmap 7.95 ( https://nmap.org )
PORT     STATE  SERVICE   VERSION
22/tcp   open   ssh       OpenSSH 8.9p1
80/tcp   open   http      nginx 1.24
3306/tcp open   mysql     MySQL 8.0.32
[CRITICAL] CVE-2024-1337 detected on port 3306

> exploit --cve CVE-2024-1337 --target 10.0.0.1:3306
Loading module: sql_injection_bypass...
Connecting to 10.0.0.1:3306...
[====>    ] Bypassing authentication filter...
[========>] Injecting payload: DROP TABLE sessions; --
[DONE] Shell escalated → root@10.0.0.1

> dump --table users --format hash
Extracting 4,821 records...
admin:$2b$12$8xkLmNpQ1rSt...
user_001:$2b$12$3mPqRsUvWx...
[OK] Dump saved → /tmp/users.dump

> install_backdoor --host 10.0.0.1 --persist --silent
Deploying rootkit...
Cron job installed: */5 * * * * /tmp/.sys ✓
Log entries purged ✓

╔══════════════════════════════╗
║    >>>  ACCESS GRANTED  <<<  ║
╚══════════════════════════════╝
`;

export default function HackerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colsRef = useRef<MatrixCol[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  // 현재까지 출력된 텍스트
  const [displayedText, setDisplayedText] = useState('');
  // 시나리오 문자열 내의 현재 인덱스
  const [charIndex, setCharIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  /* ── Matrix rain (기존 로직 유지) ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const cols = Math.floor(canvas.width / 16);
      colsRef.current = Array.from({ length: cols }, (_, i) => ({
        x: i * 16 + 4,
        y: Math.random() * canvas.height,
        speed: 0.4 + Math.random() * 1.2,
        len: 8 + Math.floor(Math.random() * 14),
      }));
    };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '14px monospace';
      for (const col of colsRef.current) {
        for (let j = 0; j < col.len; j++) {
          const alpha = (1 - j / col.len) * 0.85;
          const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillStyle = j === 0 ? `rgba(160,255,160,${alpha})` : `rgba(0,${Math.floor(130 + 100 * (1 - j / col.len))},0,${alpha * 0.8})`;
          ctx.fillText(ch, col.x, col.y - j * 16);
        }
        col.y += col.speed * 16;
        if (col.y - col.len * 16 > canvas.height) { col.y = 0; }
      }
      requestAnimationFrame(draw);
    };
    const raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  /* ── 핵심: 키 입력 핸들러 ── */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 기능키(F1~F12, Alt, Ctrl 등) 제외
    if (e.key.length > 1 && e.key !== 'Enter' && e.key !== 'Backspace') return;
    if (charIndex >= HACK_SCENARIO.length) {
      setIsDone(true);
      return;
    }

    // 키를 누를 때마다 2~4글자씩 출력해서 속도감 조절
    const increment = Math.floor(Math.random() * 3) + 2;
    const nextIndex = Math.min(charIndex + increment, HACK_SCENARIO.length);
    const newChunk = HACK_SCENARIO.slice(charIndex, nextIndex);

    setDisplayedText(prev => prev + newChunk);
    setCharIndex(nextIndex);

    // 자동 스크롤
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [charIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
      <div style={{ height: '100dvh', background: '#000', position: 'relative', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

        {/* Header */}
        <header style={{
          position: 'relative', zIndex: 10, height: 56,
          background: 'rgba(0,5,0,0.85)',
          borderBottom: '1px solid rgba(0,255,70,0.3)',
          display: 'flex', alignItems: 'center', padding: '0 16px',
          backdropFilter: 'blur(10px)',
        }}>
          <Link href="/" style={{ color: '#00e040', marginRight: 15 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
          <span style={{ color: '#00ff41', fontFamily: 'monospace', fontWeight: 700 }}>
          LIVE_INTRUSION_OS v2.1
        </span>
          <span style={{ marginLeft: 'auto', color: '#00ff41', fontSize: 12, opacity: 0.6, fontFamily: 'monospace' }}>
          {isDone ? 'CONNECTION CLOSED' : 'AWAITING INPUT...'}
        </span>
        </header>

        {/* Terminal */}
        <div style={{
          position: 'relative', zIndex: 10,
          margin: '20px auto',
          width: 'min(95%, 800px)',
          height: '80dvh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 0 30px rgba(0,255,0,0.1)'
        }}>
          <div style={{
            background: '#1a1a1a', border: '1px solid #333',
            padding: '8px 15px', borderRadius: '8px 8px 0 0',
            display: 'flex', gap: '6px'
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
          </div>

          <div
              ref={terminalRef}
              style={{
                flex: 1,
                background: 'rgba(0, 10, 0, 0.85)',
                border: '1px solid #333',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                padding: '20px',
                fontFamily: '"Fira Code", "Courier New", monospace',
                fontSize: '14px',
                color: '#00ff41',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                textShadow: '0 0 5px rgba(0,255,65,0.5)'
              }}
          >
            {displayedText}
            {!isDone && <span className="cursor" style={{
              display: 'inline-block', width: 8, height: 15,
              background: '#00ff41', marginLeft: 5,
              animation: 'blink 1s infinite'
            }} />}

            {charIndex === 0 && (
                <div style={{ textAlign: 'center', marginTop: '20%', opacity: 0.5 }}>
                  [ 시스템 해킹을 시작하려면 키보드를 아무렇게나 타이핑하세요 ]
                </div>
            )}
          </div>
        </div>

        <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #004411; borderRadius: 3px; }
      `}</style>
      </div>
  );
}