'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const ACCENT = '#d4a00a';

/* ─── Count-based horror escalation ─────────────────── */
function getHorrorLevel(count: number) {
    if (count === 0)   return { label: '잠복 중',       msg: null,                       bg: 'rgba(0,0,0,0)' };
    if (count < 5)     return { label: '발작 중',       msg: '악- 더러워',                bg: 'rgba(60,10,2,0.04)' };
    if (count < 15)    return { label: '위험 단계',     msg: '왜 자꾸 건드려...',          bg: 'rgba(60,10,2,0.09)' };
    if (count < 30)    return { label: '번식 중',       msg: '알을 낳고 있어...',          bg: 'rgba(60,10,2,0.14)' };
    if (count < 60)    return { label: '집단 서식',     msg: '지금 혼자가 아니다',         bg: 'rgba(60,10,2,0.2)' };
    if (count < 100)   return { label: '탈출 불가',     msg: '너의 집이 됐어',             bg: 'rgba(60,10,2,0.26)' };
    return              { label: '점령 완료',           msg: '이미 늦었어...',             bg: 'rgba(60,10,2,0.32)' };
}

/* ─── Disgusting cockroach SVG ───────────────────────── */
const RealisticCockroach = ({ isWiggling }: { isWiggling: boolean }) => {
    const css = `
    @keyframes legSpasm {
      0%,100%{ transform:rotate(0deg) scaleY(1); }
      12%  { transform:rotate(22deg)  scaleY(1.10); }
      30%  { transform:rotate(-26deg) scaleY(0.89); }
      50%  { transform:rotate(18deg)  scaleY(1.07); }
      70%  { transform:rotate(-28deg) scaleY(0.91); }
      88%  { transform:rotate(14deg)  scaleY(1.05); }
    }
    @keyframes antennaSway {
      0%,100%{ transform:rotate(0deg) scaleX(1); }
      30%   { transform:rotate(6deg)  scaleX(1.02); }
      70%   { transform:rotate(-5deg) scaleX(0.98); }
    }
    @keyframes antennaThrash {
      0%,100%{ transform:rotate(0deg)  scaleX(1);    }
      18%   { transform:rotate(32deg)  scaleX(1.12); }
      42%   { transform:rotate(-38deg) scaleX(0.88); }
      62%   { transform:rotate(28deg)  scaleX(1.14); }
      82%   { transform:rotate(-30deg) scaleX(0.90); }
    }
    @keyframes bodyConvulse {
      0%,100%{ transform:translate(0,0)     rotate(0deg);   }
      18%   { transform:translate(2.5px,-3.5px) rotate(1.5deg);  }
      36%   { transform:translate(-3.5px,2px)   rotate(-1.2deg); }
      54%   { transform:translate(3px,-2.5px)   rotate(0.9deg);  }
      72%   { transform:translate(-2.5px,3.5px) rotate(-1.7deg); }
      90%   { transform:translate(1.5px,-1.5px) rotate(0.6deg);  }
    }
    @keyframes idleBreath {
      0%,100%{ transform:translate(0,0); }
      50%   { transform:translate(0,0.8px); }
    }
    .leg-spasm     { animation:legSpasm 0.040s ease-in-out infinite; }
    .antenna-sway  { animation:antennaSway 3.2s ease-in-out infinite; }
    .antenna-sway2 { animation:antennaSway 3.2s ease-in-out infinite 1.6s; }
    .antenna-thrash{ animation:antennaThrash 0.030s linear infinite; }
    .body-convulse { animation:bodyConvulse 0.044s ease-in-out infinite; }
    .idle-breath   { animation:idleBreath 3.5s ease-in-out infinite; }
    `;

    return (
        <div className="relative w-full max-w-[270px] md:max-w-[310px] aspect-[2/3] flex items-center justify-center">
            <style>{css}</style>

            {/* ambient horror glow */}
            <div
                className={`absolute inset-0 rounded-[50%] transition-opacity duration-100`}
                style={{
                    background: 'radial-gradient(ellipse, #6b2500 0%, transparent 70%)',
                    filter: 'blur(50px)',
                    opacity: isWiggling ? 0.45 : 0.08,
                }}
            />

            <svg viewBox="0 0 200 310" className="w-full h-full relative z-10"
                style={{ filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.98)) drop-shadow(0 0 8px rgba(80,20,0,0.4))' }}>
                <defs>
                    {/* Leg */}
                    <linearGradient id="ck-leg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%"   stopColor="#5A2408" />
                        <stop offset="100%" stopColor="#080200" />
                    </linearGradient>
                </defs>

                {/* ── IDLE BREATH wrapper ── */}
                <g className={isWiggling ? '' : 'idle-breath'} style={{ transformOrigin: '100px 185px' }}>
                {/* ── PANIC CONVULSE wrapper ── */}
                <g className={isWiggling ? 'body-convulse' : ''} style={{ transformOrigin: '100px 178px' }}>

                {/* ════ LEGS (behind body) ════ */}

                {/* LEFT REAR */}
                <g className={isWiggling ? 'leg-spasm' : ''} style={{ transformOrigin: '74px 202px', animationDelay: '0s' }}>
                    {/* femur */}
                    <path d="M74 202 Q 52 216, 34 242" stroke="url(#ck-leg)" strokeWidth="4.8" fill="none" strokeLinecap="round" />
                    {/* tibia spines — upper */}
                    <line x1="62"  y1="212" x2="57"  y2="207" stroke="#2A0A02" strokeWidth="1.4" />
                    <line x1="55"  y1="220" x2="49"  y2="215" stroke="#2A0A02" strokeWidth="1.3" />
                    <line x1="47"  y1="230" x2="41"  y2="225" stroke="#2A0A02" strokeWidth="1.3" />
                    <line x1="40"  y1="238" x2="34"  y2="234" stroke="#2A0A02" strokeWidth="1.2" />
                    {/* tibia spines — lower */}
                    <line x1="60"  y1="214" x2="63"  y2="220" stroke="#2A0A02" strokeWidth="1.2" />
                    <line x1="52"  y1="223" x2="55"  y2="229" stroke="#2A0A02" strokeWidth="1.1" />
                    <line x1="44"  y1="233" x2="47"  y2="238" stroke="#2A0A02" strokeWidth="1.1" />
                    {/* tarsus segments */}
                    <path d="M34 242 Q 22 256, 16 266" stroke="url(#ck-leg)" strokeWidth="3.2" fill="none" strokeLinecap="round" />
                    <path d="M16 266 Q 10 273,  8 279" stroke="url(#ck-leg)" strokeWidth="2.3" fill="none" strokeLinecap="round" />
                    <path d="M8  279 Q  3 284,  1 289" stroke="url(#ck-leg)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                    {/* claws */}
                    <path d="M1 289 Q -3 293, -5 296" stroke="#1A0602" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <path d="M1 289 Q  3 293,  2 297" stroke="#1A0602" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                    <path d="M1 289 Q  5 292,  6 296" stroke="#1A0602" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                    {/* tarsal pads */}
                    <circle cx="9" cy="282" r="1.5" fill="#220802" opacity="0.6" />
                    <circle cx="17" cy="269" r="1.8" fill="#220802" opacity="0.6" />
                </g>

                {/* RIGHT REAR */}
                <g className={isWiggling ? 'leg-spasm' : ''} style={{ transformOrigin: '126px 202px', animationDelay: '0.032s' }}>
                    <path d="M126 202 Q 148 216, 166 242" stroke="url(#ck-leg)" strokeWidth="4.8" fill="none" strokeLinecap="round" />
                    <line x1="138" y1="212" x2="143" y2="207" stroke="#2A0A02" strokeWidth="1.4" />
                    <line x1="145" y1="220" x2="151" y2="215" stroke="#2A0A02" strokeWidth="1.3" />
                    <line x1="153" y1="230" x2="159" y2="225" stroke="#2A0A02" strokeWidth="1.3" />
                    <line x1="160" y1="238" x2="166" y2="234" stroke="#2A0A02" strokeWidth="1.2" />
                    <line x1="140" y1="214" x2="137" y2="220" stroke="#2A0A02" strokeWidth="1.2" />
                    <line x1="148" y1="223" x2="145" y2="229" stroke="#2A0A02" strokeWidth="1.1" />
                    <line x1="156" y1="233" x2="153" y2="238" stroke="#2A0A02" strokeWidth="1.1" />
                    <path d="M166 242 Q 178 256, 184 266" stroke="url(#ck-leg)" strokeWidth="3.2" fill="none" strokeLinecap="round" />
                    <path d="M184 266 Q 190 273, 192 279" stroke="url(#ck-leg)" strokeWidth="2.3" fill="none" strokeLinecap="round" />
                    <path d="M192 279 Q 197 284, 199 289" stroke="url(#ck-leg)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                    <path d="M199 289 Q 203 293, 205 296" stroke="#1A0602" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <path d="M199 289 Q 197 293, 198 297" stroke="#1A0602" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                    <path d="M199 289 Q 195 292, 194 296" stroke="#1A0602" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                    <circle cx="191" cy="282" r="1.5" fill="#220802" opacity="0.6" />
                    <circle cx="183" cy="269" r="1.8" fill="#220802" opacity="0.6" />
                </g>

                {/* LEFT MIDDLE */}
                <g className={isWiggling ? 'leg-spasm' : ''} style={{ transformOrigin: '66px 164px', animationDelay: '0.044s' }}>
                    <path d="M66 164 Q 36 160, 12 170" stroke="url(#ck-leg)" strokeWidth="4.0" fill="none" strokeLinecap="round" />
                    {/* upper spines */}
                    <line x1="50"  y1="162" x2="48"  y2="155" stroke="#2A0A02" strokeWidth="1.3" />
                    <line x1="39"  y1="162" x2="37"  y2="155" stroke="#2A0A02" strokeWidth="1.2" />
                    <line x1="28"  y1="163" x2="26"  y2="156" stroke="#2A0A02" strokeWidth="1.2" />
                    <line x1="20"  y1="165" x2="18"  y2="159" stroke="#2A0A02" strokeWidth="1.1" />
                    {/* lower spines */}
                    <line x1="49"  y1="163" x2="51"  y2="169" stroke="#2A0A02" strokeWidth="1.1" />
                    <line x1="38"  y1="163" x2="40"  y2="169" stroke="#2A0A02" strokeWidth="1.0" />
                    <line x1="27"  y1="165" x2="29"  y2="171" stroke="#2A0A02" strokeWidth="1.0" />
                    <path d="M12 170 Q  2 175, -3 182" stroke="url(#ck-leg)" strokeWidth="2.7" fill="none" strokeLinecap="round" />
                    <path d="M-3 182 Q -8 187,-11 193" stroke="url(#ck-leg)" strokeWidth="1.9" fill="none" strokeLinecap="round" />
                    {/* claws */}
                    <path d="M-11 193 Q -15 196,-17 199" stroke="#1A0602" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                    <path d="M-11 193 Q -12 197,-11 200" stroke="#1A0602" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                </g>

                {/* RIGHT MIDDLE */}
                <g className={isWiggling ? 'leg-spasm' : ''} style={{ transformOrigin: '134px 164px', animationDelay: '0.012s' }}>
                    <path d="M134 164 Q 164 160, 188 170" stroke="url(#ck-leg)" strokeWidth="4.0" fill="none" strokeLinecap="round" />
                    <line x1="150" y1="162" x2="152" y2="155" stroke="#2A0A02" strokeWidth="1.3" />
                    <line x1="161" y1="162" x2="163" y2="155" stroke="#2A0A02" strokeWidth="1.2" />
                    <line x1="172" y1="163" x2="174" y2="156" stroke="#2A0A02" strokeWidth="1.2" />
                    <line x1="180" y1="165" x2="182" y2="159" stroke="#2A0A02" strokeWidth="1.1" />
                    <line x1="151" y1="163" x2="149" y2="169" stroke="#2A0A02" strokeWidth="1.1" />
                    <line x1="162" y1="163" x2="160" y2="169" stroke="#2A0A02" strokeWidth="1.0" />
                    <line x1="173" y1="165" x2="171" y2="171" stroke="#2A0A02" strokeWidth="1.0" />
                    <path d="M188 170 Q 198 175, 203 182" stroke="url(#ck-leg)" strokeWidth="2.7" fill="none" strokeLinecap="round" />
                    <path d="M203 182 Q 208 187, 211 193" stroke="url(#ck-leg)" strokeWidth="1.9" fill="none" strokeLinecap="round" />
                    <path d="M211 193 Q 215 196, 217 199" stroke="#1A0602" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                    <path d="M211 193 Q 212 197, 211 200" stroke="#1A0602" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                </g>

                {/* LEFT FRONT */}
                <g className={isWiggling ? 'leg-spasm' : ''} style={{ transformOrigin: '72px 126px', animationDelay: '0.022s' }}>
                    <path d="M72 126 Q 44 110, 20 91" stroke="url(#ck-leg)" strokeWidth="3.4" fill="none" strokeLinecap="round" />
                    <line x1="54"  y1="116" x2="52"  y2="109" stroke="#2A0A02" strokeWidth="1.2" />
                    <line x1="44"  y1="108" x2="42"  y2="101" stroke="#2A0A02" strokeWidth="1.2" />
                    <line x1="33"  y1="101" x2="31"  y2="94"  stroke="#2A0A02" strokeWidth="1.1" />
                    <line x1="53"  y1="117" x2="56"  y2="124" stroke="#2A0A02" strokeWidth="1.1" />
                    <line x1="43"  y1="109" x2="46"  y2="116" stroke="#2A0A02" strokeWidth="1.0" />
                    <path d="M20  91  Q 10  81,  5  71" stroke="url(#ck-leg)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M5   71  Q  1  63, -2  56" stroke="url(#ck-leg)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                    <path d="M-2  56  Q -5  50, -4  45" stroke="#1A0602" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                    <path d="M-2  56  Q  1  51,  3  46" stroke="#1A0602" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                    <path d="M-2  56  Q  3  53,  6  49" stroke="#1A0602" strokeWidth="1.1" fill="none" strokeLinecap="round" />
                </g>

                {/* RIGHT FRONT */}
                <g className={isWiggling ? 'leg-spasm' : ''} style={{ transformOrigin: '128px 126px', animationDelay: '0.055s' }}>
                    <path d="M128 126 Q 156 110, 180 91"  stroke="url(#ck-leg)" strokeWidth="3.4" fill="none" strokeLinecap="round" />
                    <line x1="146" y1="116" x2="148" y2="109" stroke="#2A0A02" strokeWidth="1.2" />
                    <line x1="156" y1="108" x2="158" y2="101" stroke="#2A0A02" strokeWidth="1.2" />
                    <line x1="167" y1="101" x2="169" y2="94"  stroke="#2A0A02" strokeWidth="1.1" />
                    <line x1="147" y1="117" x2="144" y2="124" stroke="#2A0A02" strokeWidth="1.1" />
                    <line x1="157" y1="109" x2="154" y2="116" stroke="#2A0A02" strokeWidth="1.0" />
                    <path d="M180  91  Q 190  81, 195  71"  stroke="url(#ck-leg)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M195  71  Q 199  63, 202  56"  stroke="url(#ck-leg)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                    <path d="M202  56  Q 205  50, 204  45"  stroke="#1A0602" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                    <path d="M202  56  Q 199  51, 197  46"  stroke="#1A0602" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                    <path d="M202  56  Q 197  53, 194  49"  stroke="#1A0602" strokeWidth="1.1" fill="none" strokeLinecap="round" />
                </g>

                {/* ════ BODY IMAGE ════ */}
                {/* x=11 centers body at 100 (display width 178), legs span x=66~134 aligns to ~31% from edges
                // 바퀴벌레 크기
                */}
                <image
                    href="/images/cockroach.png"
                    x="-25" y="50"
                    width="245" height="260"
                    preserveAspectRatio="xMidYMid meet"
                />

                {/* ════ ANTENNAE — always moving ════ */}
                <g
                    className={isWiggling ? 'antenna-thrash' : 'antenna-sway'}
                    style={{ transformOrigin: '91px 79px' }}
                >
                    {/* base segment (scape) */}
                    <path d="M91 79 C 76 60, 52 44, 30 16" stroke="#1C0A02" strokeWidth="1.8" fill="none" />
                    <path d="M91 79 C 76 60, 52 44, 30 16" stroke="#3A1408" strokeWidth="1.0" fill="none" opacity="0.6" strokeDasharray="3,4" />
                    {/* flagellomere dots */}
                    {[[78,64],[65,51],[52,40],[42,28],[34,19],[28,13]] .map(([cx, cy], i) => (
                        <circle key={i} cx={cx} cy={cy} r={1.1 - i * 0.08} fill="#3C1208" />
                    ))}
                </g>
                <g
                    className={isWiggling ? 'antenna-thrash' : 'antenna-sway2'}
                    style={{ transformOrigin: '109px 79px', animationDelay: isWiggling ? '0.024s' : '0s' }}
                >
                    <path d="M109 79 C 124 60, 148 44, 170 16" stroke="#1C0A02" strokeWidth="1.8" fill="none" />
                    <path d="M109 79 C 124 60, 148 44, 170 16" stroke="#3A1408" strokeWidth="1.0" fill="none" opacity="0.6" strokeDasharray="3,4" />
                    {[[122,64],[135,51],[148,40],[158,28],[166,19],[172,13]].map(([cx, cy], i) => (
                        <circle key={i} cx={cx} cy={cy} r={1.1 - i * 0.08} fill="#3C1208" />
                    ))}
                </g>

                </g>{/* end convulse */}
                </g>{/* end breath */}
            </svg>
        </div>
    );
};

/* ─── Tiny edge cockroach silhouette ─────────────────── */
const EdgeRoach = ({ style }: { style: React.CSSProperties }) => (
    <div className="fixed pointer-events-none z-0" style={style}>
        <svg viewBox="0 0 40 60" width="32" height="48" style={{ opacity: 0.18 }}>
            <ellipse cx="20" cy="32" rx="10" ry="20" fill="#5A2008" />
            <ellipse cx="20" cy="18" rx="12" ry="9" fill="#4A1806" />
            <ellipse cx="20" cy="10" rx="4" ry="5" fill="#3A1204" />
            {[[-12,22],[-14,34],[-10,44],[12,22],[14,34],[10,44]].map(([x, y], i) => (
                <line key={i} x1={20} y1={y} x2={20 + x} y2={y + 6} stroke="#3A1008" strokeWidth="1.5" />
            ))}
        </svg>
    </div>
);

export default function CockroachPage() {
    const [isWiggling, setIsWiggling] = useState(false);
    const [count, setCount] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const mutedRef = useRef(false);

    const horror = getHorrorLevel(count);

    const playScratching = useCallback(() => {
        if (mutedRef.current) return;
        try {
            const audio = new Audio('/sounds/cockroach.mp3');
            audio.volume = 0.8;
            audio.play().catch(() => {});
        } catch { /* unsupported */ }
    }, []);

    const toggleMute = useCallback(() => {
        const next = !mutedRef.current;
        mutedRef.current = next;
        setIsMuted(next);
    }, []);

    const startWiggle = useCallback(() => {
        if (isWiggling) return;
        setIsWiggling(true);
        setCount(prev => prev + 1);
        playScratching();
        setTimeout(() => setIsWiggling(false), 650);
    }, [isWiggling, playScratching]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') { e.preventDefault(); startWiggle(); }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [startWiggle]);

    const population = Math.floor(count * 148);

    return (
        <div className="flex flex-col min-h-dvh text-zinc-100 overflow-hidden font-['Inter',sans-serif] transition-colors duration-700"
            style={{ background: '#020202' }}>

            {/* Progressive grime overlay */}
            <div className="fixed inset-0 pointer-events-none transition-opacity duration-700 z-0"
                style={{ background: horror.bg }} />

            {/* Background texture */}
            <div className="fixed inset-0 opacity-[0.04] pointer-events-none z-0
                bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

            {/* Edge roaches — appear at high counts */}
            {count >= 30 && <EdgeRoach style={{ bottom: '12%', left: '-8px',  transform: 'rotate(90deg)' }} />}
            {count >= 50 && <EdgeRoach style={{ top: '20%',   right: '-8px', transform: 'rotate(-90deg) scaleX(-1)' }} />}
            {count >= 70 && <EdgeRoach style={{ bottom: '35%', left: '-6px',  transform: 'rotate(80deg)' }} />}
            {count >= 90 && <EdgeRoach style={{ top: '50%',   right: '-6px', transform: 'rotate(-80deg) scaleX(-1)' }} />}

            {/* Header */}
            <header className="relative z-20 w-full flex items-center justify-between px-6 h-16 border-b border-zinc-900 bg-black/85 backdrop-blur-md">
                <Link href="/" className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] tracking-[0.2em] uppercase font-black">뒤로</span>
                </Link>
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleMute}
                        className="flex items-center justify-center w-9 h-9 rounded-full transition-all"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(212,160,10,0.22)',
                            color: isMuted ? 'rgba(120,90,30,0.45)' : 'rgba(212,160,10,0.8)',
                            fontSize: 16, cursor: 'pointer',
                        }}
                        title={isMuted ? '효과음 켜기' : '효과음 끄기'}
                    >
                        {isMuted ? '🔇' : '🔊'}
                    </button>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800">
                        <div className={`w-2 h-2 rounded-full transition-colors duration-75 ${isWiggling ? 'bg-red-500 animate-ping' : 'bg-emerald-700'}`} />
                        <span className="text-[9px] tracking-widest uppercase font-bold text-zinc-500">
                            {count === 0 ? 'P. americana · 잠복' : horror.label}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 gap-6">
                {/* Hazard badge */}
                <div className="flex flex-col items-center gap-1.5 opacity-30">
                    <AlertTriangle size={20} className="text-amber-600" />
                    <span className="text-[9px] tracking-[0.4em] uppercase text-zinc-500">Periplaneta americana</span>
                </div>

                {/* Cockroach */}
                <div
                    onClick={startWiggle}
                    onTouchStart={(e) => { e.preventDefault(); startWiggle(); }}
                    className="relative cursor-pointer select-none transition-transform active:scale-[0.88]"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    <RealisticCockroach isWiggling={isWiggling} />

                    {count === 0 && (
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] text-zinc-600 animate-bounce tracking-tighter whitespace-nowrap">
                            눌러서 도발
                        </div>
                    )}
                </div>

                {/* Creepy message */}
                {horror.msg && (
                    <div
                        key={horror.msg}
                        className="text-[11px] tracking-widest uppercase font-bold transition-all duration-500"
                        style={{ color: 'rgba(180,80,20,0.65)' }}
                    >
                        {horror.msg}
                    </div>
                )}

                {/* Counter */}
                <div className="text-center space-y-2">
                    <div className="text-[9px] tracking-[0.6em] uppercase text-zinc-700 font-bold">발작 횟수</div>
                    <div
                        className="text-6xl font-black tracking-tighter transition-colors duration-75 tabular-nums"
                        style={{ color: isWiggling ? ACCENT : '#1c1c1e' }}
                    >
                        {count.toLocaleString()}
                    </div>
                    {count > 0 && (
                        <div className="text-[9px] text-zinc-700 tracking-widest uppercase font-medium transition-all">
                            예상 개체 수&nbsp;
                            <span style={{ color: 'rgba(160,60,10,0.7)' }}>
                                {population.toLocaleString()}마리
                            </span>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-20 w-full px-6 py-7 border-t border-zinc-900/80 bg-black/85 backdrop-blur-md
                flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-[9px] text-zinc-700 tracking-[0.2em] uppercase font-medium order-2 md:order-1">
                    바퀴벌레 공포 극복 트레이닝 (효과 없음)
                </div>
                <div className="flex items-center gap-6 order-1 md:order-2">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] text-zinc-600 uppercase tracking-widest">입력</span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">클릭 / 스페이스 / 터치</span>
                    </div>
                    <div className="w-[1px] h-8 bg-zinc-800" />
                    <div className="flex flex-col items-start">
                        <span className="text-[8px] text-zinc-600 uppercase tracking-widest">상태</span>
                        <span
                            className="text-[10px] font-bold uppercase transition-colors duration-75"
                            style={{ color: isWiggling ? ACCENT : '#3f3f46' }}
                        >
                            {isWiggling ? '발작 중' : horror.label}
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
