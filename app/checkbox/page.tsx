'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';

/* ─── Layout constants ──────────────────────────── */
const TOTAL      = 150;
const SPACING    = 52;    // px between checkbox centres
const LEFT_PAD   = 70;
const MAX_OFFSET = 88;    // max y deviation from centre
const GOAL_X     = LEFT_PAD + TOTAL * SPACING + 80;
const CONTENT_W  = GOAL_X + 100;

const PALETTE = [
  '#f87171','#fb923c','#fbbf24','#4ade80',
  '#34d399','#22d3ee','#60a5fa','#a78bfa','#f472b6',
];

interface ItemBase { id: number; x: number; sign: number; yFrac: number; color: string; }
interface Item     { id: number; x: number; y: number; color: string; }

/* Stable pseudo-random bases (LCG, seed=7) */
function buildBases(): ItemBase[] {
  let s = 7;
  const rng = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  return Array.from({ length: TOTAL }, (_, i) => ({
    id:    i,
    x:     LEFT_PAD + i * SPACING,
    sign:  rng() > 0.5 ? 1 : -1,
    yFrac: rng(),
    color: PALETTE[Math.floor(rng() * PALETTE.length)],
  }));
}

interface Confetti { x: number; y: number; vx: number; vy: number; color: string; w: number; h: number; rot: number; rV: number; }

function formatTime(ms: number) {
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}초`;
  const m = Math.floor(s / 60);
  return `${m}분 ${(s % 60).toFixed(1)}초`;
}

export default function CheckboxPage() {
  const bases = useMemo(buildBases, []);

  /* ── Container height measurement ── */
  const scrollRef     = useRef<HTMLDivElement>(null);
  const [centerY, setCenterY] = useState(140); // fallback

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const h = entries[0].contentRect.height;
      if (h > 0) setCenterY(h / 2);
    });
    obs.observe(el);
    setCenterY(el.clientHeight / 2 || 140);
    return () => obs.disconnect();
  }, []);

  /* ── Compute item positions from measured centerY ── */
  const items: Item[] = useMemo(() =>
    bases.map(b => ({
      id:    b.id,
      x:     b.x,
      y:     centerY + b.sign * (20 + b.yFrac * MAX_OFFSET),
      color: b.color,
    })),
  [bases, centerY]);

  /* ── State ── */
  const [checked,   setChecked]   = useState<boolean[]>(() => new Array(TOTAL).fill(false));
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime,   setEndTime]   = useState<number | null>(null);
  const [elapsed,   setElapsed]   = useState(0);
  const [showDone,  setShowDone]  = useState(false);

  const startRef   = useRef<number | null>(null);
  const doneRef    = useRef(false);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const confRef    = useRef<Confetti[]>([]);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkedCount = checked.filter(Boolean).length;
  const checkedCountRef = useRef(0);
  useEffect(() => { checkedCountRef.current = checkedCount; }, [checkedCount]);

  /* ── Handle click (sequential only) ── */
  const handleClick = useCallback((id: number) => {
    if (doneRef.current) return;
    if (id !== checkedCountRef.current) return; // must be the next in sequence
    setChecked(prev => {
      const next = [...prev];
      next[id] = true;
      return next;
    });
    if (!startRef.current) {
      const now = Date.now();
      startRef.current = now;
      setStartTime(now);
    }
  }, []);

  /* ── Auto-scroll to next checkbox ── */
  useEffect(() => {
    if (checkedCount === 0) return;
    const el = scrollRef.current;
    if (!el) return;

    if (checkedCount >= TOTAL) {
      // Scroll to goal
      const target = GOAL_X - el.clientWidth / 2;
      el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
      return;
    }

    const nextItem = items[checkedCount];
    const target = nextItem.x - el.clientWidth / 2;
    el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [checkedCount, items]);

  /* ── Detect finish ── */
  useEffect(() => {
    if (checkedCount === TOTAL && startRef.current && !doneRef.current) {
      doneRef.current = true;
      const end = Date.now();
      setEndTime(end);
      if (timerRef.current) clearInterval(timerRef.current);
      launchConfetti();
      setTimeout(() => setShowDone(true), 600);
    }
  }, [checkedCount]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Elapsed timer ── */
  useEffect(() => {
    if (!startTime || endTime) return;
    timerRef.current = setInterval(() =>
      setElapsed(Date.now() - startTime), 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, endTime]);

  /* ── Confetti ── */
  const launchConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    confRef.current = Array.from({ length: 220 }, () => ({
      x:     Math.random() * canvas.width,
      y:     -20 - Math.random() * 60,
      vx:    (Math.random() - 0.5) * 7,
      vy:    3.5 + Math.random() * 4.5,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      w:     7 + Math.random() * 8,
      h:     3 + Math.random() * 4,
      rot:   Math.random() * 360,
      rV:    (Math.random() - 0.5) * 10,
    }));

    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confRef.current = confRef.current.filter(c => c.y < canvas.height + 20);
      for (const c of confRef.current) {
        c.x += c.vx; c.y += c.vy;
        c.vy += 0.1;
        c.rot += c.rV;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rot * Math.PI) / 180);
        ctx.fillStyle = c.color;
        ctx.globalAlpha = Math.min(1, (canvas.height - c.y) / 200);
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      }
      if (confRef.current.length > 0) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  /* ── Reset ── */
  const reset = useCallback(() => {
    setChecked(new Array(TOTAL).fill(false));
    setStartTime(null);
    setEndTime(null);
    setElapsed(0);
    setShowDone(false);
    startRef.current = null;
    doneRef.current  = false;
    confRef.current  = [];
    if (timerRef.current) clearInterval(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    // Scroll back to start
    scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  }, []);

  /* ── Share ── */
  const share = useCallback(async () => {
    if (!endTime || !startRef.current) return;
    const time = formatTime(endTime - startRef.current);
    const text = `🎉 체크박스 레이스 완주! ${time}만에 150개 완료! 당신도 도전해보세요!`;
    try {
      if (navigator.share) await navigator.share({ title: '체크박스 레이스', text });
      else { await navigator.clipboard.writeText(text); alert('클립보드에 복사됐어요!'); }
    } catch { /* ignore */ }
  }, [endTime]);

  const displayTime = endTime
    ? formatTime(endTime - startRef.current!)
    : startTime ? formatTime(elapsed) : null;

  /* Track height = fill available space */
  const trackH = Math.max(centerY * 2, 200);

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh', background: '#050d05' }}>
      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 shrink-0"
        style={{ height: 56, background: '#07120a', borderBottom: '1px solid rgba(34,197,94,0.2)' }}
      >
        <Link href="/" className="flex items-center justify-center rounded-xl"
          style={{ width: 36, height: 36, color: '#4ade80' }}>
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <span style={{ color: '#4ade80', fontWeight: 600 }}>✅ 체크박스 레이스</span>

        <div className="ml-auto flex items-center gap-4">
          <span style={{ fontFamily: 'monospace', fontSize: 14, color: endTime ? '#4ade80' : 'rgba(74,222,128,0.55)' }}>
            {displayTime ?? '──'}
          </span>
          <span style={{ fontSize: 13, color: 'rgba(74,222,128,0.45)' }}>
            {checkedCount}/{TOTAL}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#0a1a0a', flexShrink: 0 }}>
        <div style={{
          height: '100%',
          width: `${(checkedCount / TOTAL) * 100}%`,
          background: 'linear-gradient(to right, #16a34a, #4ade80)',
          transition: 'width 0.15s',
        }} />
      </div>

      {/* Track hint */}
      {!startTime && (
        <div style={{
          textAlign: 'center', padding: '6px 0', flexShrink: 0,
          color: 'rgba(74,222,128,0.35)', fontSize: 12,
        }}>
          → 순서대로 체크박스를 클릭하세요! (1번부터 차례로)
        </div>
      )}

      {/* Horizontal scroll track */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowX: 'auto', overflowY: 'hidden',
          position: 'relative',
          scrollbarColor: 'rgba(34,197,94,0.2) transparent',
        }}
      >
        <div style={{
          width: CONTENT_W,
          height: trackH,
          position: 'relative',
        }}>

          {/* Centre track line */}
          <div style={{
            position: 'absolute',
            left: LEFT_PAD - 20,
            right: 0,
            top: centerY,
            height: 1.5,
            background: 'rgba(34,197,94,0.08)',
          }} />

          {/* SVG connector lines */}
          <svg style={{ position: 'absolute', left: 0, top: 0, width: CONTENT_W, height: trackH, pointerEvents: 'none' }}>
            {items.map((item, i) => i > 0 && (
              <line key={i}
                x1={items[i - 1].x} y1={items[i - 1].y}
                x2={item.x}         y2={item.y}
                stroke={checked[i - 1] && checked[i] ? item.color : 'rgba(255,255,255,0.04)'}
                strokeWidth={1.2} strokeDasharray="5 5"
              />
            ))}
          </svg>

          {/* Checkboxes */}
          {items.map(item => {
            const isChecked = checked[item.id];
            const isNext    = item.id === checkedCount && !doneRef.current;
            const isLocked  = !isChecked && !isNext;

            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                style={{
                  position:     'absolute',
                  left:         item.x - 15,
                  top:          item.y - 15,
                  width:        30, height: 30,
                  borderRadius: 7,
                  border:       `2px solid ${
                    isChecked ? item.color
                    : isNext  ? item.color
                    : 'rgba(255,255,255,0.1)'
                  }`,
                  background: isChecked
                    ? `${item.color}1e`
                    : isNext
                    ? `${item.color}10`
                    : 'transparent',
                  cursor:      isLocked ? 'not-allowed' : isChecked ? 'default' : 'pointer',
                  display:     'flex', alignItems: 'center', justifyContent: 'center',
                  transition:  'border-color 0.1s, background 0.1s, box-shadow 0.1s',
                  boxShadow:   isChecked
                    ? `0 0 10px ${item.color}55`
                    : 'none',
                  opacity:     isLocked ? 0.22 : 1,
                  animation:   isNext ? 'nextPulse 1.2s ease-out infinite' : 'none',
                }}
              >
                {isChecked && (
                  <svg width={15} height={15} viewBox="0 0 15 15" fill="none">
                    <path d="M2.5 7.5l3.5 3.5 6.5-6.5" stroke={item.color}
                      strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {isNext && !isChecked && (
                  <div style={{
                    width: 7, height: 7,
                    borderRadius: '50%',
                    background: item.color,
                    opacity: 0.7,
                  }} />
                )}
              </button>
            );
          })}

          {/* Goal */}
          <div style={{
            position:  'absolute',
            left:      GOAL_X - 24,
            top:       centerY - 50,
            display:   'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <div style={{ fontSize: 40 }}>🏁</div>
            <div style={{
              fontSize: 10, color: 'rgba(74,222,128,0.4)',
              fontFamily: 'monospace', letterSpacing: 1,
            }}>GOAL</div>
          </div>

        </div>
      </div>

      {/* Confetti canvas */}
      <canvas ref={canvasRef} style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 80,
      }} />

      {/* Finish overlay */}
      {showDone && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 90,
          background: 'rgba(0,0,0,0.82)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 14,
        }}>
          <div style={{ fontSize: 72 }}>🏆</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: '#4ade80' }}>완주!</div>
          <div style={{
            fontSize: 28, fontFamily: 'monospace',
            color: '#86efac', letterSpacing: 2,
          }}>
            {formatTime(endTime! - startRef.current!)}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(74,222,128,0.45)' }}>
            150개 체크박스 완료
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button onClick={share} style={{
              padding:      '13px 26px', borderRadius: 13,
              background:   'rgba(74,222,128,0.18)',
              border:       '1.5px solid rgba(74,222,128,0.5)',
              color:        '#4ade80', cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
            }}>
              공유하기 📤
            </button>
            <button onClick={reset} style={{
              padding:    '13px 26px', borderRadius: 13,
              background: 'rgba(255,255,255,0.05)',
              border:     '1px solid rgba(255,255,255,0.14)',
              color:      '#888', cursor: 'pointer', fontSize: 14,
            }}>
              다시하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
