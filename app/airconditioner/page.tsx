'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

/* ─── Constants ──────────────────────────────────────── */
const TEMP_MIN        = 16;
const TEMP_MAX        = 30;
const ROOM_TEMP_START = 29;
const COOLING_RATE    = 0.9;  // °C per second toward set temp
const WARMING_RATE    = 0.06; // °C per second back toward ambient

type Mode     = 'COOL' | 'DRY' | 'FAN' | 'AUTO';
type FanSpeed = 'AUTO' | 'LOW' | 'MED' | 'HIGH';

const MODE_ORDER: Mode[]     = ['COOL', 'DRY', 'FAN', 'AUTO'];
const FAN_ORDER:  FanSpeed[] = ['AUTO', 'LOW', 'MED', 'HIGH'];

const MODE_ICONS: Record<Mode, string>     = { COOL: '❄️', DRY: '💧', FAN: '💨', AUTO: '🔄' };
const FAN_RATE:   Record<FanSpeed, number> = { AUTO: 9, LOW: 4, MED: 12, HIGH: 22 };

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  life: number;
  maxLife: number;
}

/* ══════════════════════════════════════════════════════
 *  Main Page
 * ══════════════════════════════════════════════════════ */
export default function AirconditionerPage() {
  const [isOn,      setIsOn]      = useState(false);
  const [setTemp,   setSetTemp]   = useState(24);
  const [roomTemp,  setRoomTemp]  = useState(ROOM_TEMP_START);
  const [mode,      setMode]      = useState<Mode>('COOL');
  const [fanSpeed,  setFanSpeed]  = useState<FanSpeed>('AUTO');
  const [louverOpen, setLouverOpen] = useState(false);

  /* Refs for rAF closure */
  const isOnRef     = useRef(false);
  const setTempRef  = useRef(24);
  const roomTempRef = useRef<number>(ROOM_TEMP_START);
  const modeRef     = useRef<Mode>('COOL');
  const fanRef      = useRef<FanSpeed>('AUTO');

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef       = useRef<number>(0);
  const lastTsRef    = useRef(0);
  const spawnAccRef  = useRef(0);

  /* Sync refs */
  useEffect(() => { isOnRef.current = isOn; setLouverOpen(isOn); }, [isOn]);
  useEffect(() => { setTempRef.current = setTemp; },   [setTemp]);
  useEffect(() => { modeRef.current = mode; },         [mode]);
  useEffect(() => { fanRef.current = fanSpeed; },      [fanSpeed]);

  /* Actions */
  const togglePower = useCallback(() => setIsOn(p => !p), []);
  const changeTemp  = useCallback((d: number) =>
    setSetTemp(p => Math.max(TEMP_MIN, Math.min(TEMP_MAX, p + d))), []);
  const cycleMode   = useCallback(() =>
    setMode(m => MODE_ORDER[(MODE_ORDER.indexOf(m) + 1) % MODE_ORDER.length]), []);
  const cycleFan    = useCallback(() =>
    setFanSpeed(f => FAN_ORDER[(FAN_ORDER.indexOf(f) + 1) % FAN_ORDER.length]), []);

  /* Keyboard */
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'Space')     { e.preventDefault(); togglePower(); }
      if (e.code === 'ArrowUp')   { e.preventDefault(); changeTemp(1); }
      if (e.code === 'ArrowDown') { e.preventDefault(); changeTemp(-1); }
    };
    window.addEventListener('keydown', onDown);
    return () => window.removeEventListener('keydown', onDown);
  }, [togglePower, changeTemp]);

  /* Canvas + rAF loop */
  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      canvas.width  = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const spawn = (cx: number, cy: number) => {
      particlesRef.current.push({
        x:       cx + (Math.random() - 0.5) * 220,
        y:       cy,
        vx:      (Math.random() - 0.5) * 35,
        vy:      35 + Math.random() * 55,
        size:    5 + Math.random() * 9,
        life:    1,
        maxLife: 2.2 + Math.random() * 2.2,
      });
    };

    const loop = (ts: number) => {
      if (lastTsRef.current === 0) lastTsRef.current = ts;
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05);
      lastTsRef.current = ts;

      const ctx = canvas.getContext('2d');
      if (!ctx) { rafRef.current = requestAnimationFrame(loop); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* Cool tint overlay */
      const coolFraction = Math.max(0, Math.min(1, (ROOM_TEMP_START - roomTempRef.current) / 12));
      if (coolFraction > 0.03) {
        ctx.fillStyle = `rgba(20, 70, 170, ${coolFraction * 0.09})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      /* Room temperature simulation */
      if (isOnRef.current && modeRef.current !== 'FAN') {
        const target = setTempRef.current;
        if (roomTempRef.current > target) {
          roomTempRef.current = Math.max(target, roomTempRef.current - COOLING_RATE * dt);
          setRoomTemp(roomTempRef.current);
        }
      } else if (!isOnRef.current && roomTempRef.current < ROOM_TEMP_START) {
        roomTempRef.current = Math.min(ROOM_TEMP_START, roomTempRef.current + WARMING_RATE * dt);
        setRoomTemp(roomTempRef.current);
      }

      /* Spawn particles from louver position */
      if (isOnRef.current) {
        const louverX = canvas.width / 2;
        const louverY = canvas.height * 0.41;
        spawnAccRef.current += FAN_RATE[fanRef.current] * dt;
        while (spawnAccRef.current >= 1) {
          spawn(louverX, louverY);
          spawnAccRef.current -= 1;
        }
      }

      /* Cull */
      if (particlesRef.current.length > 220)
        particlesRef.current = particlesRef.current.slice(-220);
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      /* Update + draw */
      for (const p of particlesRef.current) {
        p.life -= dt / p.maxLife;
        if (p.life <= 0) continue;

        const t = 1 - p.life;
        p.x  += p.vx * dt;
        p.y  += p.vy * dt;
        p.vy += 12 * dt;
        p.vx *= (1 - 0.28 * dt);

        const sz = p.size + p.size * 0.7 * Math.sqrt(t);
        const op = Math.sin(Math.min(t, 0.8) * Math.PI) * 0.38 * p.life;
        if (op < 0.01) continue;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz);
        g.addColorStop(0,   `rgba(190, 225, 255, ${op * 0.9})`);
        g.addColorStop(0.4, `rgba(160, 205, 250, ${op * 0.5})`);
        g.addColorStop(1,   'rgba(130, 185, 245, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  const displayRoomTemp = roomTemp.toFixed(1);
  const isCooling = isOn && mode !== 'FAN' && roomTemp > setTemp + 0.3;

  return (
    <div
      className="flex flex-col overflow-hidden select-none"
      style={{ height: '100dvh', background: '#060e20' }}
    >
      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 shrink-0 z-20"
        style={{ height: 56, background: '#0a1628', borderBottom: '1px solid rgba(59,130,246,0.2)' }}
      >
        <Link href="/" className="flex items-center justify-center rounded-xl"
          style={{ width: 36, height: 36, color: '#93c5fd' }}>
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <span className="text-base font-semibold text-blue-200">❄️ 에어컨</span>
      </header>

      {/* Content */}
      <div
        ref={containerRef}
        className="relative flex flex-col items-center justify-between flex-1 overflow-hidden"
        style={{
          padding: '24px 16px 20px',
          background: isOn
            ? 'radial-gradient(ellipse at 50% 0%, #0b2050 0%, #060e20 65%)'
            : '#060e20',
          transition: 'background 2.5s ease',
        }}
        onClick={togglePower}
      >
        {/* Canvas */}
        <canvas ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 2 }} />

        {/* AC unit */}
        <div className="w-full flex justify-center" style={{ zIndex: 5 }}>
          <AcUnit
            isOn={isOn}
            setTemp={setTemp}
            roomTemp={parseFloat(displayRoomTemp)}
            mode={mode}
            fanSpeed={fanSpeed}
            louverOpen={louverOpen}
          />
        </div>

        {/* Room temperature readout */}
        <div className="flex flex-col items-center gap-1" style={{ zIndex: 5 }}>
          <div className="text-xs tracking-widest uppercase"
            style={{ color: 'rgba(147,197,253,0.4)' }}>실내 온도</div>
          <div
            className="font-thin"
            style={{
              fontSize: 'clamp(48px, 12vw, 72px)',
              color: isOn ? '#93c5fd' : '#2d4a6a',
              transition: 'color 1.5s',
              lineHeight: 1,
            }}
          >
            {displayRoomTemp}°
          </div>
          <div className="text-xs h-4" style={{ color: 'rgba(96,165,250,0.5)' }}>
            {isCooling ? `↓ ${setTemp}°C 목표 냉각 중` :
              isOn && mode === 'FAN' ? '송풍 모드' :
              isOn ? '설정 온도 도달' :
              '스페이스바 / 화면 터치로 켜기'}
          </div>
        </div>

        {/* Remote */}
        <div style={{ zIndex: 5 }} onClick={e => e.stopPropagation()}>
          <Remote
            isOn={isOn}
            setTemp={setTemp}
            mode={mode}
            fanSpeed={fanSpeed}
            onToggle={togglePower}
            onTempUp={() => changeTemp(1)}
            onTempDown={() => changeTemp(-1)}
            onMode={cycleMode}
            onFan={cycleFan}
          />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
 *  Wall-mount AC unit SVG
 * ────────────────────────────────────────────────────── */
interface AcUnitProps {
  isOn: boolean;
  setTemp: number;
  roomTemp: number;
  mode: Mode;
  fanSpeed: FanSpeed;
  louverOpen: boolean;
}

function AcUnit({ isOn, setTemp, roomTemp, mode, fanSpeed, louverOpen }: AcUnitProps) {
  const W = 480, H = 118;
  const finAngle = louverOpen ? 42 : 4;
  const finRad   = (finAngle * Math.PI) / 180;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%"
      style={{ maxWidth: 480, display: 'block', filter: isOn ? 'drop-shadow(0 6px 18px rgba(59,130,246,0.28))' : 'none', transition: 'filter 1s' }}>
      <defs>
        <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#dce6f2" />
          <stop offset="100%" stopColor="#b8c8da" />
        </linearGradient>
        <linearGradient id="face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#edf2f8" />
          <stop offset="55%"  stopColor="#d8e3ef" />
          <stop offset="100%" stopColor="#bccad8" />
        </linearGradient>
        <linearGradient id="louverBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c0ceda" />
          <stop offset="100%" stopColor="#a8bac8" />
        </linearGradient>
        {isOn && (
          <radialGradient id="glow" cx="50%" cy="100%" r="60%">
            <stop offset="0%" stopColor="rgba(96,165,250,0.18)" />
            <stop offset="100%" stopColor="rgba(96,165,250,0)" />
          </radialGradient>
        )}
      </defs>

      {/* Wall bracket shadow */}
      <rect x={20} y={4} width={440} height={H - 4} rx={14} fill="rgba(0,0,0,0.28)" />

      {/* Main body */}
      <rect x={18} y={2} width={444} height={H - 6} rx={13} fill="url(#body)" />
      <rect x={20} y={4} width={440} height={H - 14} rx={11} fill="url(#face)" />

      {/* Top intake grill slots */}
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={25} y={8 + i * 4.2} width={430} height={2.2}
          rx={1} fill="rgba(155,175,200,0.35)" />
      ))}

      {/* Left display panel recess */}
      <rect x={22} y={6} width={128} height={H - 18} rx={9}
        fill="rgba(30,50,90,0.1)" stroke="rgba(100,130,170,0.15)" strokeWidth={1} />

      {/* LCD display */}
      <rect x={28} y={13} width={116} height={60} rx={6}
        fill={isOn ? '#07172e' : '#080f1e'}
        stroke={isOn ? 'rgba(59,130,246,0.4)' : 'rgba(40,60,90,0.4)'} strokeWidth={1.2} />

      {isOn ? (
        <>
          {/* Set temperature */}
          <text x={38} y={41} fontSize={26} fontFamily="'Courier New', monospace" fontWeight="bold"
            fill="#60a5fa">{setTemp}°</text>
          <text x={38} y={52} fontSize={7.5} fill="rgba(148,163,184,0.7)"
            fontFamily="sans-serif" letterSpacing={0.8}>SET</text>

          {/* Room temp */}
          <text x={100} y={38} fontSize={15} fontFamily="'Courier New', monospace"
            fill="#93c5fd">{roomTemp.toFixed(1)}°</text>
          <text x={100} y={48} fontSize={7} fill="rgba(148,163,184,0.55)"
            fontFamily="sans-serif">ROOM</text>

          {/* Mode text */}
          <text x={38} y={65} fontSize={8.5} fill="#7dd3fc" fontFamily="sans-serif"
            letterSpacing={1}>{mode}</text>

          {/* Fan speed dots */}
          {(['AUTO','LOW','MED','HIGH'] as FanSpeed[]).map((s, i) => (
            <circle key={s} cx={88 + i * 9} cy={63} r={3.2}
              fill={fanSpeed === s ? '#38bdf8' : 'rgba(60,90,130,0.35)'} />
          ))}
        </>
      ) : (
        <>
          <text x={86} y={46} fontSize={10} fill="rgba(70,100,140,0.4)"
            fontFamily="sans-serif" textAnchor="middle">- - -</text>
          <text x={86} y={59} fontSize={7.5} fill="rgba(60,85,120,0.3)"
            fontFamily="sans-serif" textAnchor="middle">STANDBY</text>
        </>
      )}

      {/* LED power indicator */}
      <circle cx={118} cy={82} r={4.5}
        fill={isOn ? '#22c55e' : '#1e3040'}
        stroke={isOn ? 'rgba(34,197,94,0.3)' : 'none'} strokeWidth={5} />
      {isOn && <circle cx={118} cy={82} r={8} fill="rgba(34,197,94,0.15)" />}

      {/* Timer LED (dim) */}
      <circle cx={104} cy={82} r={3} fill="rgba(250,204,21,0.12)" />

      {/* Right side vertical ribs */}
      {[170, 230, 295, 360, 415].map((x, i) => (
        <rect key={i} x={x} y={9} width={20} height={H - 20} rx={4}
          fill="rgba(180,198,220,0.16)" />
      ))}

      {/* Model label */}
      <text x={350} y={H - 22} fontSize={8.5} fill="rgba(140,160,185,0.45)"
        fontFamily="sans-serif" fontStyle="italic" textAnchor="middle">SmartCool Pro</text>

      {/* Louver housing */}
      <rect x={22} y={H - 21} width={436} height={18} rx={5}
        fill="url(#louverBg)" stroke="rgba(120,145,170,0.3)" strokeWidth={1} />

      {/* Louver fins — rotate around top pivot */}
      {Array.from({ length: 11 }, (_, i) => {
        const px  = 38 + i * 38;
        const py  = H - 19;
        const len = 16;
        const ex  = px + len * Math.sin(finRad);
        const ey  = py + len * Math.cos(finRad);
        return (
          <line key={i}
            x1={px} y1={py} x2={ex} y2={ey}
            stroke={isOn ? '#8090a8' : '#6a7a8c'}
            strokeWidth={3.5} strokeLinecap="round" />
        );
      })}

      {/* Ambient glow under louver when on */}
      {isOn && (
        <rect x={18} y={H - 22} width={444} height={22} rx={5}
          fill="url(#glow)" />
      )}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────
 *  Remote control
 * ────────────────────────────────────────────────────── */
interface RemoteProps {
  isOn: boolean;
  setTemp: number;
  mode: Mode;
  fanSpeed: FanSpeed;
  onToggle: () => void;
  onTempUp: () => void;
  onTempDown: () => void;
  onMode: () => void;
  onFan: () => void;
}

const btnBase: React.CSSProperties = {
  display:        'flex',
  flexDirection:  'column',
  alignItems:     'center',
  justifyContent: 'center',
  height:         44,
  borderRadius:   10,
  background:     'rgba(255,255,255,0.04)',
  border:         '1px solid rgba(100,130,170,0.2)',
  color:          'rgba(148,163,184,0.85)',
  cursor:         'pointer',
  fontSize:       11,
  fontFamily:     'sans-serif',
  letterSpacing:  0.6,
  gap:            2,
  transition:     'background 0.15s, border-color 0.15s',
};

function Remote({ isOn, setTemp, mode, fanSpeed, onToggle, onTempUp, onTempDown, onMode, onFan }: RemoteProps) {
  return (
    <div style={{
      width:        168,
      background:   'linear-gradient(160deg, #1c2438 0%, #141c2e 100%)',
      borderRadius: 22,
      padding:      '16px 14px 20px',
      border:       `1px solid ${isOn ? 'rgba(59,130,246,0.3)' : 'rgba(80,100,140,0.18)'}`,
      boxShadow:    isOn
        ? '0 0 32px rgba(59,130,246,0.18), 0 8px 24px rgba(0,0,0,0.5)'
        : '0 8px 24px rgba(0,0,0,0.45)',
      transition:   'box-shadow 1s, border-color 1s',
    }}>

      {/* LCD */}
      <div style={{
        background:   isOn ? '#06152b' : '#080f1e',
        borderRadius: 10,
        padding:      '10px 14px 12px',
        marginBottom: 14,
        border:       `1.5px solid ${isOn ? 'rgba(37,99,235,0.55)' : 'rgba(30,50,80,0.6)'}`,
        minHeight:    70,
        transition:   'border-color 0.8s',
      }}>
        {isOn ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{
                fontSize: 32, fontFamily: "'Courier New', monospace",
                fontWeight: 'bold', color: '#60a5fa', lineHeight: 1,
              }}>
                {setTemp}°
              </span>
              <span style={{ fontSize: 12, color: 'rgba(96,165,250,0.6)' }}>C</span>
            </div>
            <div style={{
              marginTop: 6, fontSize: 10, color: '#7dd3fc',
              letterSpacing: 1.2, fontFamily: 'sans-serif',
            }}>
              {MODE_ICONS[mode]} {mode}  ·  {fanSpeed}
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 52, color: 'rgba(60,85,120,0.5)', fontSize: 12,
            fontFamily: 'sans-serif', letterSpacing: 2,
          }}>
            OFF
          </div>
        )}
      </div>

      {/* Power button */}
      <button
        onClick={onToggle}
        style={{
          width:          '100%',
          height:         44,
          borderRadius:   11,
          background:     isOn ? 'rgba(239,68,68,0.18)' : 'rgba(34,197,94,0.18)',
          border:         `1.5px solid ${isOn ? '#ef4444' : '#22c55e'}`,
          color:          isOn ? '#f87171' : '#4ade80',
          cursor:         'pointer',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          marginBottom:   10,
          transition:     'all 0.2s',
        }}
      >
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2.5}>
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />
        </svg>
      </button>

      {/* Temp ▲/▼ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <button onClick={onTempUp}   style={{ ...btnBase, fontSize: 13, fontWeight: 'bold' }}>
          ▲<span style={{ fontSize: 9, marginTop: -2 }}>TEMP</span>
        </button>
        <button onClick={onTempDown} style={{ ...btnBase, fontSize: 13, fontWeight: 'bold' }}>
          ▼<span style={{ fontSize: 9, marginTop: -2 }}>TEMP</span>
        </button>
      </div>

      {/* Mode + Fan speed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <button onClick={onMode} style={btnBase}>
          <span style={{ fontSize: 14 }}>{MODE_ICONS[mode]}</span>
          <span style={{ fontSize: 9 }}>MODE</span>
        </button>
        <button onClick={onFan}  style={btnBase}>
          <span style={{ fontSize: 14 }}>💨</span>
          <span style={{ fontSize: 9 }}>FAN</span>
        </button>
      </div>

      {/* Decorative inactive buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[['⏱', 'TIMER'], ['😴', 'SLEEP']].map(([icon, label]) => (
          <div key={label} style={{
            ...btnBase,
            opacity:     0.38,
            cursor:      'default',
            userSelect:  'none',
          }}>
            <span style={{ fontSize: 13 }}>{icon}</span>
            <span style={{ fontSize: 9 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
