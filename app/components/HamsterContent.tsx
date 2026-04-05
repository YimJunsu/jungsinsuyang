'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Scene geometry ──────────────────────────────────
 *  Scene SVG viewBox: 0 0 480 320
 *  Wheel centre  : (WX, WY)
 *  Outer radius  : WR   (entire wheel rim)
 *  Inner radius  : WIR  (running surface inner edge)
 *  Hamster origin: (HX, HY) — local (0,0) maps here
 * ─────────────────────────────────────────────────── */
const WX  = 295;
const WY  = 130;
const WR  = 115;
const WIR = 90;
const HX  = 285;
const HY  = 155;

/* ─── Leg type ──────────────────────────────────────── */
type Pt  = [number, number];
type Leg = [Pt, Pt, Pt]; // attachment → knee → foot

function lp(leg: Leg, dy: number): string {
  return leg.map(([x, y]) => `${x},${y + dy}`).join(' ');
}

/* ─── Leg positions ─────────────────────────────────── */
const IDLE: Record<string, Leg> = {
  nf: [[-4, 52], [-13, 57], [-15, 63]],
  ff: [[-2, 53], [-10, 58], [-12, 63]],
  nb: [[35, 55], [ 37, 59], [ 39, 63]],
  fb: [[37, 56], [ 39, 60], [ 41, 63]],
};

//  Frame 0: near side strides forward, far side pushes back
//  Frame 1: opposite — creates diagonal gait
const FRAMES: Record<string, Record<string, Leg>> = {
  '0': {
    nf: [[-4, 52], [-20, 57], [-24, 63]],  // near-front: reaches left
    ff: [[-2, 53], [  3, 58], [  6, 63]],  // far-front:  pushes right
    nb: [[35, 55], [ 43, 58], [ 47, 63]],  // near-back:  pushes right
    fb: [[37, 56], [ 32, 59], [ 27, 63]],  // far-back:   swings left
  },
  '1': {
    nf: [[-4, 52], [  3, 57], [  6, 63]],
    ff: [[-2, 53], [-20, 58], [-24, 63]],
    nb: [[35, 55], [ 32, 58], [ 27, 63]],
    fb: [[37, 56], [ 43, 59], [ 47, 63]],
  },
};

/* ══════════════════════════════════════════════════════
 *  Main component
 * ══════════════════════════════════════════════════════ */
export default function HamsterContent() {
  const [isRunning,  setIsRunning]  = useState(false);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [legFrame,   setLegFrame]   = useState<0 | 1>(0);
  const [distance,   setDistance]   = useState(0);
  const [isMuted,    setIsMuted]    = useState(false);
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [bubbleKey,  setBubbleKey]  = useState(0);

  const angleRef         = useRef(0);
  const distanceRef      = useRef(0);
  const rafRef           = useRef<number>(0);
  const frameCountRef    = useRef(0);
  const audioRef         = useRef<HTMLAudioElement | null>(null);
  const mutedRef         = useRef(false);
  const lastMilestoneRef = useRef(0);   // last 500m milestone triggered
  const bubbleTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startRunning = useCallback(() => setIsRunning(true), []);
  const stopRunning  = useCallback(() => setIsRunning(false), []);

  /* ── Audio setup ────────────────────────────────── */
  useEffect(() => {
    const audio = new Audio('/audio/hamster-theme.mp3');
    audio.loop   = true;
    audio.volume = 0.45;
    audioRef.current = audio;

    const tryPlay = () => audio.play().catch(() => {/* already playing or user will trigger */});

    // Attempt autoplay immediately
    const autoplayPromise = audio.play();
    if (autoplayPromise !== undefined) {
      autoplayPromise.catch(() => {
        // Autoplay blocked — play on first user interaction
        const resume = () => {
          if (!mutedRef.current) tryPlay();
          document.removeEventListener('click',      resume);
          document.removeEventListener('touchstart', resume);
          document.removeEventListener('keydown',    resume);
        };
        document.addEventListener('click',      resume, { once: true });
        document.addEventListener('touchstart', resume, { once: true });
        document.addEventListener('keydown',    resume, { once: true });
      });
    }

    // Pause when tab is hidden, resume when visible
    const onVisibility = () => {
      if (document.hidden) {
        audio.pause();
      } else if (!mutedRef.current) {
        tryPlay();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      audio.pause();
      audio.src = '';
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setIsMuted(next);
    if (audioRef.current) {
      if (next) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  }, []);

  /* keyboard */
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) { e.preventDefault(); startRunning(); }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); stopRunning(); }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [startRunning, stopRunning]);

  /* ── Bubble messages ──────────────────────────── */
  const BUBBLE_MSGS = ['어우 힘들어..', '언제 까지 할거야 ㅡㅡ', '달려어어엇!!!'];

  const triggerBubble = useCallback(() => {
    const txt = BUBBLE_MSGS[Math.floor(Math.random() * BUBBLE_MSGS.length)];
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    setBubbleText(txt);
    setBubbleKey(k => k + 1);
    bubbleTimerRef.current = setTimeout(() => setBubbleText(null), 2500);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* rAF loop */
  useEffect(() => {
    if (!isRunning) return;
    frameCountRef.current = 0;
    const animate = () => {
      angleRef.current    = (angleRef.current + 6) % 360;
      distanceRef.current += 0.07;
      frameCountRef.current++;
      setWheelAngle(angleRef.current);
      if (frameCountRef.current % 7 === 0) setLegFrame(f => (f === 0 ? 1 : 0));
      if (frameCountRef.current % 4 === 0) {
        const d = Math.floor(distanceRef.current);
        setDistance(d);
        /* 500m milestone check */
        const milestone = Math.floor(distanceRef.current / 500);
        if (milestone > lastMilestoneRef.current) {
          lastMilestoneRef.current = milestone;
          triggerBubble();
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, triggerBubble]);

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full h-full select-none overflow-hidden"
      style={{ background: '#160c04', cursor: 'pointer' }}
      onTouchStart={(e) => { e.preventDefault(); startRunning(); }}
      onTouchEnd={stopRunning}
      onTouchCancel={stopRunning}
      onMouseDown={startRunning}
      onMouseUp={stopRunning}
      onMouseLeave={stopRunning}
    >
      {/* Mute toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleMute(); }}
        className="absolute top-4 right-4 z-20 flex items-center justify-center rounded-full transition-colors"
        style={{
          width: 36, height: 36,
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(220,170,80,0.25)',
          color: isMuted ? 'rgba(140,100,40,0.5)' : 'rgba(220,170,80,0.85)',
          fontSize: 18,
          cursor: 'pointer',
        }}
        title={isMuted ? '음악 켜기' : '음악 끄기'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* HUD */}
      <div className="absolute top-4 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none z-10">
        <p className="text-sm" style={{ color: 'rgba(220,170,80,0.7)' }}>
          {isRunning ? '🐹 전력 질주 중!' : '스페이스바를 꾹 누르세요 / 모바일: 화면을 꾹 터치'}
        </p>
        <p className="text-xs" style={{ color: 'rgba(180,130,60,0.5)' }}>
          누적 거리: {distance.toLocaleString()} m
        </p>
      </div>

      {/* Scene */}
        <div className="w-full h-full flex items-center justify-center px-2">
          <div className="w-full max-w-325 aspect-3/2">
            <svg viewBox="0 0 480 320" width="100%" style={{ display: 'block' }}>

              {/* Layer 1 — cage background */}
              <CageBackground />

              {/* Layer 2 — decorations (behind wheel) */}
              <HamsterHouse />
              <WaterBottle />

              {/* Layer 3 — wheel stand (behind wheel) */}
              <WheelStand />

              {/* Layer 4 — wheel (rotating) */}
              <g transform={`rotate(${wheelAngle}, ${WX}, ${WY})`}>
                <WheelBody />
              </g>
              {/* Static axle pin */}
              <circle cx={WX} cy={WY} r={5} fill="#302e28" />

              {/* Layer 5 — hamster (side profile, facing left) */}
              <g transform={`translate(${HX}, ${HY})`}>
                <Hamster legFrame={legFrame} isRunning={isRunning} />
              </g>

              {/* Layer 6 — foreground decoration */}
              <FoodBowl />

              {/* Layer 7 — speed lines */}
              {isRunning && <SpeedLines />}

              {/* Layer 8 — cage outer frame */}
              <rect x={20} y={15} width={440} height={270} rx={14}
                fill="none" stroke="#7A5430" strokeWidth={9} />

              {/* Layer 9 — speech bubble */}
              {bubbleText && (
                <SpeechBubble key={bubbleKey} text={bubbleText} />
              )}
            </svg>
        </div>
      </div>
      <p className="absolute bottom-5 text-xs" style={{ color: 'rgba(150,100,40,0.4)' }}>
        제한 없음 — 마음껏 달리세요!
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
 *  Cage background + bedding
 * ────────────────────────────────────────────────────── */
function CageBackground() {
  /* deterministic "wood shaving" ellipses */
  const shavings: [number, number, number, number, number][] = [
    [38,252,20,5, 10], [66,258,16,4, 40], [96,254,22,5,-15], [130,261,14,4, 60],
    [162,253,18,5, 25],[196,259,20,4,-30],[228,256,16,5, 50],[260,262,24,4,  5],
    [342,255,20,5,-20],[372,260,14,4, 70],[402,257,22,5, 15],[433,262,16,4,-50],
    [ 52,268,18,4, 80],[ 82,274,22,5,-10],[112,270,14,4, 45],[148,268,20,5, 30],
    [178,273,16,4,-40],[213,269,24,5, 65],[246,273,18,4,-25],[270,266,14,4, 55],
    [356,268,20,5, -5],[386,274,16,4, 35],[416,270,18,5,-60],[446,267,12,4, 20],
  ];
  return (
    <>
      <rect x={20} y={15} width={440} height={270} rx={14} fill="#E8D098" />
      <rect x={28} y={23} width={424} height={255} fill="#F2E2B0" />
      {[82, 152, 218].map(y => (
        <rect key={y} x={28} y={y} width={424} height={2.5} rx={1}
          fill="rgba(150,100,50,0.14)" />
      ))}
      {/* Bedding */}
      <rect x={28} y={244} width={424} height={34} fill="#B87030" />
      {shavings.map(([cx, cy, rx, ry, rot], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry}
          transform={`rotate(${rot},${cx},${cy})`}
          fill={i % 3 === 0 ? '#D4963A' : i % 3 === 1 ? '#C47828' : '#E0A040'}
          opacity={0.75} />
      ))}
    </>
  );
}

/* ──────────────────────────────────────────────────────
 *  Small wooden house (left side)
 * ────────────────────────────────────────────────────── */
function HamsterHouse() {
  const bx = 38, by = 186, bw = 108, bh = 58;
  return (
    <g>
      {/* Roof */}
      <polygon
        points={`${bx - 8},${by} ${bx + bw + 8},${by} ${bx + bw / 2},${by - 34}`}
        fill="#7A4E22" />
      <line x1={bx - 8} y1={by - 11} x2={bx + bw + 8} y2={by - 11}
        stroke="#6A3E14" strokeWidth={2} />
      {/* Chimney */}
      <rect x={bx + 68} y={by - 44} width={14} height={24} rx={2} fill="#8A5828" />
      <rect x={bx + 65} y={by - 48} width={20} height={7} rx={2} fill="#9A6838" />
      {/* Walls */}
      <rect x={bx} y={by} width={bw} height={bh} fill="#9A6832" />
      {[by + 14, by + 28, by + 43].map(ly => (
        <line key={ly} x1={bx + 5} y1={ly} x2={bx + bw - 5} y2={ly}
          stroke="rgba(60,30,5,0.18)" strokeWidth={1} />
      ))}
      {/* Arched door */}
      <path
        d={`M ${bx+37},${by+bh} L ${bx+37},${by+28}
            Q ${bx+52},${by+16} ${bx+67},${by+28}
            L ${bx+67},${by+bh}`}
        fill="#2E1608" />
      <path
        d={`M ${bx+37},${by+bh} L ${bx+37},${by+28}
            Q ${bx+52},${by+16} ${bx+67},${by+28}
            L ${bx+67},${by+bh}`}
        fill="none" stroke="#5A3010" strokeWidth={2} />
    </g>
  );
}

/* ──────────────────────────────────────────────────────
 *  Water bottle (right wall)
 * ────────────────────────────────────────────────────── */
function WaterBottle() {
  return (
    <g>
      <rect x={446} y={80} width={10} height={90} rx={3} fill="#9A6030" />
      <rect x={420} y={72} width={28} height={86} rx={9}
        fill="rgba(180,220,255,0.65)" stroke="#8090A0" strokeWidth={1.5} />
      <rect x={422} y={112} width={24} height={44} rx={5} fill="rgba(70,150,220,0.38)" />
      <rect x={422} y={95} width={24} height={18} rx={3} fill="rgba(255,255,255,0.4)" />
      <rect x={426} y={65} width={16} height={10} rx={4}
        fill="rgba(180,220,255,0.65)" stroke="#8090A0" strokeWidth={1.5} />
      <rect x={426} y={60} width={16} height={8} rx={3} fill="#5070A0" />
      <rect x={414} y={146} width={8} height={12} rx={2} fill="#6080A0" />
      <circle cx={411} cy={157} r={4.5} fill="#90A8C0" />
    </g>
  );
}

/* ──────────────────────────────────────────────────────
 *  Wheel stand — central post + wide base
 * ────────────────────────────────────────────────────── */
function WheelStand() {
  return (
    <g>
      <rect x={240} y={242} width={110} height={12} rx={5} fill="#9A7850" />
      <rect x={289} y={WY + 20} width={12} height={244 - (WY + 20)} rx={4} fill="#A88860" />
    </g>
  );
}

/* ──────────────────────────────────────────────────────
 *  Wheel body — rendered inside a rotating <g>
 * ────────────────────────────────────────────────────── */
function WheelBody() {
  return (
    <>
      {/* Back plate */}
      <circle cx={WX} cy={WY} r={WR - 3} fill="#DEDAD2" />
      {/* Inner marking ring */}
      <circle cx={WX} cy={WY} r={WIR + 7} fill="none" stroke="#CCCAC0" strokeWidth={3} />
      {/* 18 running rungs */}
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i * 20 * Math.PI) / 180;
        return (
          <line key={i}
            x1={WX + (WIR - 2) * Math.cos(a)} y1={WY + (WIR - 2) * Math.sin(a)}
            x2={WX + (WR - 6)  * Math.cos(a)} y2={WY + (WR - 6)  * Math.sin(a)}
            stroke="#B8B4AA" strokeWidth={4} strokeLinecap="round" />
        );
      })}
      {/* Outer rim */}
      <circle cx={WX} cy={WY} r={WR} fill="none" stroke="#969088" strokeWidth={8} />
      {/* Inner rim */}
      <circle cx={WX} cy={WY} r={WIR} fill="none" stroke="#B4B0A8" strokeWidth={3.5} />
      {/* Hub */}
      <circle cx={WX} cy={WY} r={14} fill="#888078" />
      <circle cx={WX} cy={WY} r={7}  fill="#686058" />
    </>
  );
}

/* ──────────────────────────────────────────────────────
 *  Food bowl (foreground)
 * ────────────────────────────────────────────────────── */
function FoodBowl() {
  const cx = 82, cy = 249;
  return (
    <g>
      <ellipse cx={cx} cy={cy + 5} rx={29} ry={8} fill="rgba(0,0,0,0.12)" />
      <ellipse cx={cx} cy={cy}     rx={29} ry={11} fill="#C09060" />
      <ellipse cx={cx} cy={cy - 1} rx={22} ry={7}  fill="#D0A870" />
      {([[-7,-2],[1,-3],[9,-1],[-3,2],[6,3]] as [number,number][]).map(([dx,dy],i) => (
        <ellipse key={i} cx={cx+dx} cy={cy+dy} rx={3} ry={2}
          fill={i % 2 === 0 ? '#8A6020' : '#A07030'} />
      ))}
    </g>
  );
}

/* ──────────────────────────────────────────────────────
 *  Speed lines (opacity animation, left of hamster)
 * ────────────────────────────────────────────────────── */
function SpeedLines() {
  const lines: [number, number, number, number, number][] = [
    [163, 125, 207, 125, 1.8],
    [157, 138, 202, 138, 1.5],
    [161, 151, 205, 151, 1.2],
    [165, 164, 206, 164, 1.0],
    [159, 177, 200, 177, 0.8],
  ];
  return (
    <g>
      {lines.map(([x1, y1, x2, y2, sw], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#E8C060" strokeWidth={sw} strokeLinecap="round"
          style={{
            animation: `speedLinePulse ${0.38 + i * 0.06}s ease-out ${i * 0.08}s infinite`,
          }} />
      ))}
    </g>
  );
}

/* ══════════════════════════════════════════════════════
 *  Hamster — side profile, facing LEFT
 *  Local origin (0,0) is translated to (HX, HY) in scene
 * ══════════════════════════════════════════════════════ */
interface HamsterProps { legFrame: 0 | 1; isRunning: boolean; }

function Hamster({ legFrame, isRunning }: HamsterProps) {
  const bob = isRunning ? (legFrame === 0 ? -2 : 2) : 0;
  const L   = isRunning ? FRAMES[String(legFrame)] : IDLE;

  /* helper: near-front foot position for paw toes */
  const nfFoot = L.nf[2];

  return (
    <g>
      {/* ─── Far-side legs (behind body) ─── */}
      <polyline points={lp(L.ff, bob)} fill="none"
        stroke="#8A5420" strokeWidth={4.5}
        strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={lp(L.fb, bob)} fill="none"
        stroke="#8A5420" strokeWidth={4.5}
        strokeLinecap="round" strokeLinejoin="round" />

      {/* ─── Tail ─── */}
      <ellipse cx={53} cy={47 + bob} rx={9}  ry={6} fill="#E0A870" />
      <ellipse cx={59} cy={46 + bob} rx={4}  ry={3} fill="#ECC090" />

      {/* ─── Body ─── */}
      <ellipse cx={22} cy={42 + bob} rx={34} ry={23} fill="#C8804A" />
      {/* Dorsal stripe */}
      <ellipse cx={28} cy={33 + bob} rx={9}  ry={22} fill="#B87040"
        opacity={0.3} transform={`rotate(-10,28,${33 + bob})`} />
      {/* Belly */}
      <ellipse cx={16} cy={51 + bob} rx={23} ry={14} fill="#EECD96" />

      {/* ─── Head ─── */}
      <circle cx={-13} cy={29 + bob} r={23} fill="#C8804A" />
      {/* Subtle forehead highlight */}
      <ellipse cx={-20} cy={19 + bob} rx={12} ry={8}
        fill="rgba(255,200,140,0.18)" />

      {/* ─── Cheek pouch (hallmark of hamsters) ─── */}
      <ellipse cx={-30} cy={42 + bob} rx={16} ry={14} fill="#D49060" />
      <ellipse cx={-36} cy={37 + bob} rx={7}  ry={5}
        fill="rgba(255,220,160,0.25)" />

      {/* ─── Ear ─── */}
      <ellipse cx={-11} cy={10 + bob} rx={9} ry={11} fill="#C8804A" />
      <ellipse cx={-11} cy={11 + bob} rx={6} ry={8}  fill="#F0A8A8" />

      {/* ─── Eye ─── */}
      <circle cx={-26} cy={24 + bob} r={5.5} fill="#1a1a1a" />
      <circle cx={-24} cy={22 + bob} r={2}   fill="white" />
      <circle cx={-28} cy={26 + bob} r={0.9} fill="rgba(255,255,255,0.45)" />

      {/* ─── Nose ─── */}
      <ellipse cx={-46} cy={38 + bob} rx={4.5} ry={3.5} fill="#C07060" />
      <ellipse cx={-46} cy={37 + bob} rx={2.5} ry={1.5} fill="#D08070" />

      {/* ─── Mouth ─── */}
      <path d={`M -48 ${41 + bob} Q -46 ${44 + bob} -44 ${41 + bob}`}
        fill="none" stroke="#A05040" strokeWidth={1.2} strokeLinecap="round" />

      {/* ─── Whiskers (3, pointing left) ─── */}
      {([
        [-46, 36, -50, 33],
        [-46, 39, -51, 39],
        [-46, 42, -50, 42],
      ] as const).map(([x1, y1, x2, y2], i) => (
        <line key={i}
          x1={x1} y1={y1 + bob} x2={x2} y2={y2 + bob}
          stroke="rgba(255,255,255,0.6)" strokeWidth={0.9} />
      ))}

      {/* ─── Near-side legs (in front of body) ─── */}
      <polyline points={lp(L.nf, bob)} fill="none"
        stroke="#B07840" strokeWidth={5.5}
        strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={lp(L.nb, bob)} fill="none"
        stroke="#B07840" strokeWidth={5.5}
        strokeLinecap="round" strokeLinejoin="round" />

      {/* ─── Paw toes on near-front foot ─── */}
      <circle cx={nfFoot[0] - 4} cy={nfFoot[1] + bob} r={2.2} fill="#C08050" />
      <circle cx={nfFoot[0]}     cy={nfFoot[1] + bob} r={2.2} fill="#C08050" />
      <circle cx={nfFoot[0] + 4} cy={nfFoot[1] + bob} r={2.2} fill="#C08050" />
    </g>
  );
}

/* ──────────────────────────────────────────────────────
 *  Speech bubble — appears above hamster on 500m milestone
 *  SVG coords: hamster head ≈ (272, 184) in scene space
 *  Bubble anchored at cx=255, top y=55
 * ────────────────────────────────────────────────────── */
function SpeechBubble({ text }: { text: string }) {
  /* Estimate bubble width by character count (Korean ≈ 13px, ASCII ≈ 8px) */
  const charW = 13;
  const PAD   = 18;
  const BH    = 34;
  const BW    = Math.max(100, text.length * charW + PAD * 2);
  const CX    = 255; // horizontal centre (above hamster head)
  const TOP   = 52;  // top of bubble rect
  const TailX = 258; // tail tip x
  const TailY = TOP + BH + 14; // tail bottom

  return (
    <g style={{ animation: 'bubblePop 2.5s ease-out forwards' }}>
      {/* Drop shadow */}
      <rect
        x={CX - BW / 2 + 2} y={TOP + 3}
        width={BW} height={BH} rx={11}
        fill="rgba(0,0,0,0.18)"
      />
      {/* Bubble body */}
      <rect
        x={CX - BW / 2} y={TOP}
        width={BW} height={BH} rx={11}
        fill="#fffef8" stroke="#c8a040" strokeWidth={1.8}
      />
      {/* Tail polygon — points down-left toward hamster head */}
      <polygon
        points={`${CX - 10},${TOP + BH - 1} ${CX + 6},${TOP + BH - 1} ${TailX},${TailY}`}
        fill="#fffef8"
      />
      {/* Tail outline (two sides only, no top) */}
      <polyline
        points={`${CX - 10},${TOP + BH} ${TailX},${TailY} ${CX + 6},${TOP + BH}`}
        fill="none" stroke="#c8a040" strokeWidth={1.8}
        strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Text */}
      <text
        x={CX} y={TOP + BH / 2 + 5}
        fontSize={12} fontFamily="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
        fontWeight="700" fill="#3d1f04"
        textAnchor="middle"
      >
        {text}
      </text>
    </g>
  );
}
