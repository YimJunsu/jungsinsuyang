'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, Share2, Trophy } from 'lucide-react';

type FloatNotif = {
  id: number;
  text: string;
  type: 'gain' | 'lose';
};

const STILL_SECS = 60;
const ACCENT = '#818cf8';

const GAIN_MSGS = [
  '완벽한 정지',
  '이게 진정한 수양',
  '훌륭합니다',
  '경이롭습니다',
  '역시 당신이에요',
];

const LOSE_MSGS = [
  '움직이셨잖아요',
  '왜 움직임?',
  '실망입니다',
  '잠깐, 지금 뭔가 했죠?',
  '제발요',
];

export default function StandPage() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(STILL_SECS);
  const [notifs, setNotifs] = useState<FloatNotif[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [figOffset, setFigOffset] = useState({ x: 0, y: 0, r: 0 });
  const [shared, setShared] = useState(false);
  const notifId = useRef(0);
  const cooldown = useRef(false);

  const addNotif = useCallback((text: string, type: 'gain' | 'lose') => {
    const id = ++notifId.current;
    setNotifs(prev => [...prev, { id, text, type }]);
    setTimeout(() => setNotifs(prev => prev.filter(n => n.id !== id)), 2400);
  }, []);

  const triggerMove = useCallback(() => {
    if (cooldown.current) return;
    cooldown.current = true;

    const rx = (Math.random() - 0.5) * 44;
    const ry = (Math.random() - 0.5) * 22;
    const rr = (Math.random() - 0.5) * 20;

    setIsMoving(true);
    setFigOffset({ x: rx, y: ry, r: rr });
    setScore(s => s - 1);
    addNotif(
      `-1점  ${LOSE_MSGS[Math.floor(Math.random() * LOSE_MSGS.length)]}`,
      'lose',
    );
    setTimeLeft(STILL_SECS);

    // Spring-back after brief pause
    setTimeout(() => {
      setIsMoving(false);
      setFigOffset({ x: 0, y: 0, r: 0 });
      setTimeout(() => { cooldown.current = false; }, 700);
    }, 60);
  }, [addNotif]);

  // Input listeners (keyboard + mouse click)
  useEffect(() => {
    const onKey = () => triggerMove();
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, a')) return;
      triggerMove();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('click', onClick);
    };
  }, [triggerMove]);

  // 60-second stillness timer
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setScore(s => s + 1);
          addNotif(
            `+1점  ${GAIN_MSGS[Math.floor(Math.random() * GAIN_MSGS.length)]}`,
            'gain',
          );
          return STILL_SECS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [addNotif]);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `정신수양 '그냥 서 있기' 도전!\n가만히 서서 ${score}점을 획득했어요.\n당신도 도전해보세요: ${url}`;
    if (navigator.share) {
      try { await navigator.share({ title: '그냥 서 있기', text, url }); } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch { /* not supported */ }
    }
  };

  const progress = ((STILL_SECS - timeLeft) / STILL_SECS) * 100;

  return (
    <div className="min-h-dvh bg-[#06060f] text-zinc-100 flex flex-col select-none overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900/70">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-200 transition-colors text-[11px] font-bold tracking-[0.25em] uppercase"
        >
          <ChevronLeft size={14} />
          Back
        </Link>
        <span className="text-[9px] tracking-[0.35em] uppercase text-zinc-700 font-bold">처방 #14</span>
        <div className="w-16" />
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center py-10 relative">

        {/* Status */}
        <p
          className={`mb-10 text-[11px] font-bold tracking-[0.25em] uppercase transition-all duration-300 ${
            isMoving ? 'text-red-400' : 'text-indigo-400'
          }`}
        >
          {isMoving ? '⚠  움직임 감지됨' : '◉  가만히 있는 중'}
        </p>

        {/* Figure + floating notifications */}
        <div className="relative">
          {/* Notifications — top-right of figure */}
          <div
            className="absolute pointer-events-none"
            style={{ top: 0, left: '100%', paddingLeft: '14px', width: '160px' }}
          >
            {notifs.map(n => (
              <div
                key={n.id}
                className={[
                  'text-sm font-black whitespace-nowrap leading-snug mb-1',
                  'animate-[floatUp_2.4s_ease-out_forwards]',
                  n.type === 'gain' ? 'text-indigo-400' : 'text-red-400',
                ].join(' ')}
              >
                {n.text}
              </div>
            ))}
          </div>

          {/* Stick figure */}
          <div
            style={{
              transform: `translate(${figOffset.x}px, ${figOffset.y}px) rotate(${figOffset.r}deg)`,
              transition: isMoving
                ? 'none'
                : 'transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <StickFigure isMoving={isMoving} />
          </div>
        </div>

        {/* Progress bar + countdown */}
        <div className="mt-14 flex flex-col items-center gap-2 w-56">
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/60">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(to right, #4f46e5, ${ACCENT})`,
              }}
            />
          </div>
          <p className="text-[10px] text-zinc-600 font-mono tracking-widest">
            {timeLeft}s 가만히 있으면 +1점
          </p>
        </div>
      </main>

      {/* Footer: score + share */}
      <footer className="px-6 py-5 border-t border-zinc-900/70 flex items-center justify-center gap-3">
        {/* Score panel */}
        <div className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-800 rounded-2xl px-5 py-3 shadow-lg">
          <Trophy size={15} className="text-indigo-400 shrink-0" />
          <div>
            <p className="text-[8px] text-zinc-600 tracking-[0.3em] uppercase font-bold leading-none mb-1">
              총 점수
            </p>
            <p
              className="text-2xl font-black tabular-nums leading-none"
              style={{ color: ACCENT }}
            >
              {score}
              <span className="text-xs text-zinc-500 font-bold ml-0.5">점</span>
            </p>
          </div>
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-2 bg-zinc-900/40 border border-zinc-800 rounded-2xl px-5 py-3 hover:border-indigo-500/40 hover:bg-indigo-950/20 transition-all text-zinc-500 hover:text-indigo-300 font-bold text-[11px] tracking-widest uppercase shadow-lg"
        >
          <Share2 size={14} />
          {shared ? '복사됨' : '공유'}
        </button>
      </footer>
    </div>
  );
}

function StickFigure({ isMoving }: { isMoving: boolean }) {
  return (
    <svg
      width="130"
      height="230"
      viewBox="0 0 130 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="사람 모형"
    >
      <defs>
        <filter id="figGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#figGlow)">
        {/* Head */}
        <circle cx="65" cy="34" r="22" stroke="#818cf8" strokeWidth="3" />

        {/* Facial expression */}
        {isMoving ? (
          <>
            {/* Surprised eyes */}
            <circle cx="56" cy="30" r="3.5" fill="#818cf8" />
            <circle cx="74" cy="30" r="3.5" fill="#818cf8" />
            {/* Raised eyebrows */}
            <path d="M52 21 Q56 18 60 21" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M70 21 Q74 18 78 21" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Open-mouth O */}
            <ellipse cx="65" cy="43" rx="5" ry="5.5" fill="#818cf8" opacity="0.55" />
          </>
        ) : (
          <>
            {/* Calm eyes (slightly closed/relaxed) */}
            <ellipse cx="56" cy="31" rx="2.5" ry="2" fill="#818cf8" />
            <ellipse cx="74" cy="31" rx="2.5" ry="2" fill="#818cf8" />
            {/* Smile */}
            <path d="M55 40 Q65 48 75 40" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        )}

        {/* Neck */}
        <line x1="65" y1="56" x2="65" y2="68" stroke="#818cf8" strokeWidth="3.5" strokeLinecap="round" />

        {/* Torso */}
        <line x1="65" y1="68" x2="65" y2="138" stroke="#818cf8" strokeWidth="3.5" strokeLinecap="round" />

        {/* Arms */}
        {isMoving ? (
          <>
            {/* Flailing arms up */}
            <line x1="65" y1="88" x2="26" y2="62" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
            <line x1="65" y1="88" x2="104" y2="62" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Relaxed arms down */}
            <line x1="65" y1="88" x2="30" y2="118" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
            <line x1="65" y1="88" x2="100" y2="118" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
          </>
        )}

        {/* Legs */}
        <line x1="65" y1="138" x2="40" y2="192" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
        <line x1="65" y1="138" x2="90" y2="192" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />

        {/* Feet */}
        <line x1="40" y1="192" x2="22" y2="200" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
        <line x1="90" y1="192" x2="108" y2="200" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
