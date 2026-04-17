'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/* ════════════════════════════════════════════
   상수
════════════════════════════════════════════ */
const DURATION_MS = 1_800_000; // 30분

/** SVG 기본 크기 (right-facing) */
const SW = 210; // width
const SH = 130; // height

/* ════════════════════════════════════════════
   밀리초 → MM:SS
════════════════════════════════════════════ */
function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/* ════════════════════════════════════════════
   진행률별 메시지
════════════════════════════════════════════ */
function getMsg(pct: number) {
  if (pct >= 100) return '🎉 축하합니다! 30분을 완전히 낭비했습니다.';
  if (pct >= 99)  return '......이제 됐습니다.';
  if (pct >= 95)  return '거의 다 왔습니다. (진짜임)';
  if (pct >= 90)  return '90%... 아직도 3분 남음';
  if (pct >= 75)  return '75%... 이제 거의 다 왔습니다. (아직 아님)';
  if (pct >= 66)  return '2/3... 인내심 테스트 통과 중';
  if (pct >= 50)  return '반 왔습니다. 15분 낭비 완료. 15분 더 남음.';
  if (pct >= 40)  return '40%... 12분 남았습니다. (체감 1시간)';
  if (pct >= 33)  return '1/3 지점. 20분이 남았습니다. 돌아가세요.';
  if (pct >= 20)  return '20%... 아직 24분 남았습니다. (포기 권장)';
  if (pct >= 10)  return '10%... 무려 27분이 남아있습니다.';
  if (pct >= 5)   return '5%... 고통의 시작입니다.';
  return '달팽이가 30분짜리 여행을 시작했습니다.';
}

/* ════════════════════════════════════════════
   달팽이 SVG  — 오른쪽을 바라봄
════════════════════════════════════════════ */
function SnailSVG() {
  return (
    <svg
      width={SW} height={SH}
      viewBox={`0 0 ${SW} ${SH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="sn-shell" cx="42%" cy="36%" r="62%">
          <stop offset="0%"   stopColor="#D09040" />
          <stop offset="50%"  stopColor="#8B4513" />
          <stop offset="100%" stopColor="#5A2008" />
        </radialGradient>
        <radialGradient id="sn-body" cx="50%" cy="25%" r="75%">
          <stop offset="0%"   stopColor="#E8CC90" />
          <stop offset="100%" stopColor="#C8A060" />
        </radialGradient>
        <radialGradient id="sn-eye" cx="35%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#2a1a00" />
          <stop offset="100%" stopColor="#0a0500" />
        </radialGradient>
      </defs>

      {/* ─ 몸통 ─ */}
      <path
        d="M6 97 Q46 112 98 105 Q140 99 162 88 Q176 81 170 72 Q160 62 137 67 Q107 75 70 82 Q42 88 6 97 Z"
        fill="url(#sn-body)"
      />
      {/* 몸통 하단 질감 */}
      <path
        d="M10 101 Q50 114 102 107 Q142 101 163 91"
        stroke="rgba(100,65,15,0.25)" strokeWidth="2.5" fill="none"
      />
      {/* 몸통 상단 하이라이트 */}
      <path
        d="M30 90 Q80 101 130 96 Q155 93 165 86"
        stroke="rgba(255,230,160,0.22)" strokeWidth="2" fill="none"
        strokeLinecap="round"
      />

      {/* ─ 껍데기 ─ */}
      <circle cx="67" cy="58" r="50" fill="url(#sn-shell)" />
      {/* 껍데기 링 */}
      <circle cx="67" cy="58" r="40" fill="none" stroke="rgba(50,16,0,0.30)" strokeWidth="3.5" />
      <circle cx="67" cy="58" r="28" fill="none" stroke="rgba(50,16,0,0.26)" strokeWidth="3"   />
      <circle cx="67" cy="58" r="17" fill="none" stroke="rgba(45,12,0,0.22)" strokeWidth="2.5" />
      <circle cx="67" cy="58" r="8"  fill="rgba(40,10,0,0.55)" />
      {/* 껍데기 광택 */}
      <ellipse cx="51" cy="40" rx="17" ry="12"
               fill="rgba(255,255,255,0.14)"
               transform="rotate(-22 51 40)" />
      <ellipse cx="48" cy="38" rx="8" ry="6"
               fill="rgba(255,255,255,0.09)"
               transform="rotate(-22 48 38)" />

      {/* ─ 머리 ─ */}
      <ellipse cx="170" cy="74" rx="18" ry="15" fill="url(#sn-body)" />

      {/* ─ 눈 자루 (왼쪽) ─ */}
      <path
        d="M165 64 Q167 51 169 41"
        stroke="#C8A060" strokeWidth="6" strokeLinecap="round" fill="none"
      />
      {/* ─ 눈 자루 (오른쪽) ─ */}
      <path
        d="M175 68 Q179 55 183 46"
        stroke="#C8A060" strokeWidth="6" strokeLinecap="round" fill="none"
      />

      {/* ─ 왼쪽 눈 ─ */}
      <circle cx="169" cy="40" r="9"   fill="url(#sn-eye)" />
      <circle cx="171" cy="37" r="3.8" fill="white" opacity="0.88" />
      <circle cx="170" cy="38" r="2"   fill="rgba(255,255,255,0.5)" />

      {/* ─ 오른쪽 눈 ─ */}
      <circle cx="183" cy="45" r="9"   fill="url(#sn-eye)" />
      <circle cx="185" cy="42" r="3.8" fill="white" opacity="0.88" />
      <circle cx="184" cy="43" r="2"   fill="rgba(255,255,255,0.5)" />

      {/* ─ 미소 ─ */}
      <path
        d="M164 81 Q169 85 175 82"
        stroke="#9A7035" strokeWidth="2.2" fill="none" strokeLinecap="round"
      />
    </svg>
  );
}

/* ════════════════════════════════════════════
   세로 모드 오버레이 (모바일 portrait)
════════════════════════════════════════════ */
function PortraitOverlay() {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: '#020202',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 28,
      }}
    >
      <div style={{ fontSize: 72, animation: 'rot-hint 2.5s ease-in-out infinite' }}>
        📱
      </div>
      <p style={{
        color: '#fff', fontSize: 20, fontWeight: 800,
        letterSpacing: '-0.02em', textAlign: 'center',
      }}>
        화면을 가로로 돌려주세요
      </p>
      <p style={{ color: '#555', fontSize: 13, textAlign: 'center', lineHeight: 1.6 }}>
        달팽이는 가로 화면에서<br />
        위에서 아래로 이동합니다
      </p>
      <style>{`
        @keyframes rot-hint {
          0%,30%  { transform: rotate(0deg); }
          55%,85% { transform: rotate(90deg); }
          100%    { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════
   메인 페이지
════════════════════════════════════════════ */
export default function SnailPage() {

  /* ─ 방향 감지 ─ */
  const [isMobile,  setIsMobile]  = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    check();
    window.addEventListener('resize', check);
    const handler = () => setTimeout(check, 120);
    window.addEventListener('orientationchange', handler);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', handler);
    };
  }, []);

  /* ─ 타이머 state (1초마다 re-render) ─ */
  const [elapsed,  setElapsed]  = useState(0);
  const [started,  setStarted]  = useState(false);

  /* ─ RAF용 refs (re-render 없이 DOM 직접 수정) ─ */
  const snailRef     = useRef<HTMLDivElement>(null);
  const slimeRef     = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const rafRef       = useRef<number>(0);
  const isVertRef    = useRef(false);   // mobile = vertical mode
  const isRunRef     = useRef(false);   // RAF 실행 여부

  /* isMobile 변화 → ref 동기화 */
  useEffect(() => { isVertRef.current = isMobile; }, [isMobile]);

  /* ─ RAF 콜백 (안정적 — 의존성 없음, 모두 ref로 접근) ─ */
  const rafTick = useCallback(() => {
    if (!isRunRef.current || !startTimeRef.current) return;

    const e        = Math.min(Date.now() - startTimeRef.current, DURATION_MS);
    const progress = e / DURATION_MS;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const vert = isVertRef.current;

    /* ── 달팽이 위치 계산 ──
       vertical mode: SVG를 90deg CW 회전 → 시각적 크기: SW→SH 너비, SH→SW 높이
       90deg CW, transform-origin: center 일 때:
         시각 TL의 CSS 오프셋: X += (SW/2 - SH/2), Y -= (SW/2 - SH/2)
       역산하면:
         cssLeft = visualLeft - (SW/2 - SH/2)
         cssTop  = visualTop  + (SW/2 - SH/2)
    */
    if (snailRef.current) {
      if (vert) {
        const vW  = SH;                              // 시각 너비 (130)
        const vH  = SW;                              // 시각 높이 (210)
        const off = (SW - SH) / 2;                  // = (210-130)/2 = 40
        const vx  = W / 2 - vW / 2;                 // 수평 중앙 고정
        const vy  = progress * Math.max(0, H - vH); // 위 → 아래
        snailRef.current.style.left      = `${vx - off}px`;
        snailRef.current.style.top       = `${vy + off}px`;
        snailRef.current.style.transform = 'rotate(90deg)';
      } else {
        const maxX = Math.max(0, W - SW);
        snailRef.current.style.left      = `${progress * maxX}px`;
        snailRef.current.style.top       = `${H / 2 - SH / 2}px`;
        snailRef.current.style.transform = 'none';
      }
    }

    /* ── 점액 흔적 ── */
    if (slimeRef.current) {
      if (vert) {
        const vH       = SW;
        const centerX  = W / 2;
        const trailH   = progress * Math.max(0, H - vH) + vH * 0.45;
        slimeRef.current.style.left       = `${centerX - 6}px`;
        slimeRef.current.style.top        = '0px';
        slimeRef.current.style.width      = '12px';
        slimeRef.current.style.height     = `${trailH}px`;
        slimeRef.current.style.background =
          'linear-gradient(to bottom, transparent, rgba(90,190,20,0.12) 25%, rgba(120,210,30,0.32))';
        slimeRef.current.style.borderRadius = '0 0 6px 6px';
      } else {
        const centerY  = H / 2;
        const trailW   = progress * Math.max(0, W - SW) + SW * 0.45;
        slimeRef.current.style.left       = '0px';
        slimeRef.current.style.top        = `${centerY - 6}px`;
        slimeRef.current.style.width      = `${trailW}px`;
        slimeRef.current.style.height     = '12px';
        slimeRef.current.style.background =
          'linear-gradient(to right, transparent, rgba(90,190,20,0.12) 25%, rgba(120,210,30,0.32))';
        slimeRef.current.style.borderRadius = '0 6px 6px 0';
      }
    }

    if (e < DURATION_MS) {
      rafRef.current = requestAnimationFrame(rafTick);
    } else {
      isRunRef.current = false;
    }
  }, []);

  /* ─ RAF 시작/정지 ─ */
  useEffect(() => {
    const shouldRun = !isMobile || !isPortrait;
    if (shouldRun) {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      setStarted(true);
      isRunRef.current = true;
      rafRef.current = requestAnimationFrame(rafTick);
    } else {
      isRunRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile, isPortrait, rafTick]);

  /* ─ 1초마다 state 갱신 (re-render → 타이머/퍼센트 표시) ─ */
  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => {
      if (!startTimeRef.current) return;
      setElapsed(Math.min(Date.now() - startTimeRef.current, DURATION_MS));
    }, 1000);
    return () => clearInterval(t);
  }, [started]);

  /* ─ 파생값 ─ */
  const pct       = Math.min(100, Math.floor((elapsed / DURATION_MS) * 100));
  const remaining = Math.max(0, DURATION_MS - elapsed);
  const done      = pct >= 100;

  /* ─ Render ─ */
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: '#020202',
        overflow: 'hidden',
        fontFamily: '"Inter", "Apple SD Gothic Neo", sans-serif',
      }}
    >
      {/* 세로 모드 경고 */}
      {isMobile && isPortrait && <PortraitOverlay />}

      {/* 헤더 */}
      <header
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 52, zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          background: 'rgba(2,2,2,0.88)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #111',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: '#555', textDecoration: 'none',
            fontSize: 10, letterSpacing: '0.2em',
            textTransform: 'uppercase', fontWeight: 900,
          }}
        >
          <ArrowLeft size={15} />
          뒤로
        </Link>

        {/* 진행률 바 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#333', fontSize: 11, fontFamily: 'monospace', minWidth: 38 }}>
            {fmt(elapsed)}
          </span>
          <div style={{
            width: 100, height: 4,
            background: '#111', borderRadius: 99,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: done
                ? 'linear-gradient(to right, #7fd020, #b0f040)'
                : 'linear-gradient(to right, #4a9a10, #7fd020)',
              borderRadius: 99,
              transition: 'width 0.95s linear',
            }} />
          </div>
          <span style={{ color: '#333', fontSize: 11, fontFamily: 'monospace', minWidth: 30 }}>
            {pct}%
          </span>
        </div>

        <div style={{ width: 60 }} />
      </header>

      {/* 점액 흔적 */}
      <div
        ref={slimeRef}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          zIndex: 2,
          filter: 'blur(1px)',
        }}
      />

      {/* 달팽이 */}
      <div
        ref={snailRef}
        style={{
          position: 'absolute',
          zIndex: 5,
          pointerEvents: 'none',
          transformOrigin: '50% 50%',
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))',
        }}
      >
        <SnailSVG />
      </div>

      {/* 완료 파티클 오버레이 */}
      {done && (
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(2,2,2,0.55)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div style={{ textAlign: 'center', animation: 'pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <p style={{ fontSize: 64, marginBottom: 16 }}>🐌</p>
            <p style={{ color: '#7fd020', fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>
              완주했습니다
            </p>
            <p style={{ color: '#444', fontSize: 13, marginTop: 8 }}>
              30분이라는 소중한 시간을 낭비했습니다
            </p>
          </div>
          <style>{`
            @keyframes pop-in {
              from { transform: scale(0.5); opacity: 0; }
              to   { transform: scale(1);   opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* 하단 상태 바 */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 52, zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          background: 'rgba(2,2,2,0.88)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid #111',
        }}
      >
        <p
          style={{
            color: done ? '#7fd020' : '#383838',
            fontSize: 12,
            fontStyle: 'italic',
            transition: 'color 0.6s',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {getMsg(pct)}
        </p>
        <p style={{
          color: '#1e1e1e', fontSize: 11,
          fontFamily: 'monospace',
          flexShrink: 0, marginLeft: 16,
        }}>
          {done ? '완료' : `남은 시간 ${fmt(remaining)}`}
        </p>
      </div>
    </div>
  );
}
