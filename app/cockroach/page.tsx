'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const ACCENT = '#d4a00a';

const RealisticCockroach = ({ isWiggling }: { isWiggling: boolean }) => {
    const styles = `
    @keyframes legSpasm {
      0%, 100% { transform: rotate(0deg) scaleY(1); }
      15%  { transform: rotate(16deg)  scaleY(1.06); }
      35%  { transform: rotate(-18deg) scaleY(0.94); }
      55%  { transform: rotate(13deg)  scaleY(1.04); }
      75%  { transform: rotate(-20deg) scaleY(0.96); }
    }
    @keyframes antennaThrash {
      0%, 100% { transform: rotate(0deg) scaleX(1); }
      20%  { transform: rotate(24deg)  scaleX(1.07); }
      45%  { transform: rotate(-28deg) scaleX(0.92); }
      65%  { transform: rotate(20deg)  scaleX(1.09); }
      85%  { transform: rotate(-22deg) scaleX(0.95); }
    }
    @keyframes bodyConvulse {
      0%, 100% { transform: translate(0,0) rotate(0deg); }
      20%  { transform: translate(1.5px,-2.5px) rotate(0.8deg); }
      40%  { transform: translate(-2.5px,1.5px) rotate(-0.6deg); }
      60%  { transform: translate(2px,-1.5px) rotate(0.5deg); }
      80%  { transform: translate(-1.5px,2px) rotate(-0.9deg); }
    }
    .leg-spasm { 
      animation: legSpasm 0.045s ease-in-out infinite alternate; 
    }
    .antenna-thrash { 
      animation: antennaThrash 0.035s linear infinite; 
    }
    .body-convulse { 
      animation: bodyConvulse 0.05s ease-in-out infinite alternate; 
    }
    `;

    return (
        <div className="relative w-full max-w-[260px] md:max-w-[300px] aspect-[2/3] flex items-center justify-center">
            <style>{styles}</style>

            {/* ambient glow */}
            <div className={`absolute inset-0 rounded-[50%] blur-[80px] transition-opacity duration-150 ${isWiggling ? 'opacity-30' : 'opacity-0'}`}
                style={{ background: '#7a3800' }} />

            <svg viewBox="0 0 200 300" className="w-full h-full relative z-10"
                style={{ filter: 'drop-shadow(0 10px 28px rgba(0,0,0,0.97))' }}>
                <defs>
                    <radialGradient id="ck-body-dirty" cx="38%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#CC6030" />
                        <stop offset="20%" stopColor="#8C3818" />
                        <stop offset="50%" stopColor="#4C1A08" />
                        <stop offset="70%" stopColor="#2B0F06" />
                        <stop offset="100%" stopColor="#0C0200" />
                    </radialGradient>
                    <radialGradient id="ck-pronot" cx="42%" cy="28%" r="72%">
                        <stop offset="0%"   stopColor="#B25020" />
                        <stop offset="45%"  stopColor="#7A2E10" />
                        <stop offset="100%" stopColor="#200A02" />
                    </radialGradient>
                    <radialGradient id="ck-head" cx="40%" cy="35%" r="65%">
                        <stop offset="0%"   stopColor="#5C2010" />
                        <stop offset="100%" stopColor="#0C0402" />
                    </radialGradient>
                    <linearGradient id="ck-leg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%"   stopColor="#6C2C0E" />
                        <stop offset="100%" stopColor="#0A0402" />
                    </linearGradient>
                    <radialGradient id="ck-eye" cx="32%" cy="32%" r="65%">
                        <stop offset="0%"   stopColor="#2E6040" />
                        <stop offset="100%" stopColor="#081410" />
                    </radialGradient>
                    <linearGradient id="ck-gloss" x1="10%" y1="0%" x2="60%" y2="100%">
                        <stop offset="0%"   stopColor="rgba(255,220,170,0.20)" />
                        <stop offset="45%"  stopColor="rgba(255,200,140,0.07)" />
                        <stop offset="100%" stopColor="rgba(255,200,140,0)" />
                    </linearGradient>
                    <linearGradient id="ck-cerci" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%"   stopColor="#6A2A0C" />
                        <stop offset="100%" stopColor="#1E0A04" />
                    </linearGradient>
                </defs>

                <g className={isWiggling ? 'body-convulse' : ''} style={{ transformOrigin: '100px 178px' }}>

                    {/* ===== LEGS (behind body) ===== */}

                    {/* LEFT REAR */}
                    <g className={isWiggling ? 'leg-spasm' : ''} style={{ transformOrigin: '75px 200px', animationDelay: '0s' }}>
                        <path d="M75 200 Q 48 218, 28 250" stroke="url(#ck-leg)" strokeWidth="4.2" fill="none" strokeLinecap="round" />
                        <line x1="56"  y1="221" x2="50"  y2="228" stroke="#380E04" strokeWidth="1.6" />
                        <line x1="43"  y1="237" x2="37"  y2="243" stroke="#380E04" strokeWidth="1.6" />
                        <line x1="36"  y1="246" x2="30"  y2="251" stroke="#380E04" strokeWidth="1.3" />
                        {/* tarsus */}
                        <path d="M28 250 Q 18 262, 13 270" stroke="url(#ck-leg)" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                        <path d="M13 270 Q  7 276,  5 281" stroke="url(#ck-leg)" strokeWidth="2"   fill="none" strokeLinecap="round" />
                        <path d="M5  281 Q  1 285, -1 288" stroke="url(#ck-leg)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                    </g>

                    {/* RIGHT REAR */}
                    <g className={isWiggling ? 'leg-spasm' : ''} style={{ transformOrigin: '125px 200px', animationDelay: '0.03s' }}>
                        <path d="M125 200 Q 152 218, 172 250" stroke="url(#ck-leg)" strokeWidth="4.2" fill="none" strokeLinecap="round" />
                        <line x1="144" y1="221" x2="150" y2="228" stroke="#380E04" strokeWidth="1.6" />
                        <line x1="157" y1="237" x2="163" y2="243" stroke="#380E04" strokeWidth="1.6" />
                        <line x1="164" y1="246" x2="170" y2="251" stroke="#380E04" strokeWidth="1.3" />
                        <path d="M172 250 Q 182 262, 187 270" stroke="url(#ck-leg)" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                        <path d="M187 270 Q 193 276, 195 281" stroke="url(#ck-leg)" strokeWidth="2"   fill="none" strokeLinecap="round" />
                        <path d="M195 281 Q 199 285, 201 288" stroke="url(#ck-leg)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                    </g>

                    {/* LEFT MIDDLE */}
                    <g className={isWiggling ? 'leg-spasm' : ''} style={{ transformOrigin: '68px 163px', animationDelay: '0.04s' }}>
                        <path d="M68 163 Q 37 161, 14 172" stroke="url(#ck-leg)" strokeWidth="3.6" fill="none" strokeLinecap="round" />
                        <line x1="44"  y1="162" x2="42"  y2="155" stroke="#380E04" strokeWidth="1.5" />
                        <line x1="27"  y1="165" x2="25"  y2="158" stroke="#380E04" strokeWidth="1.5" />
                        <path d="M14 172 Q  4 177, -1 183" stroke="url(#ck-leg)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                        <path d="M-1 183 Q -6 188, -8 193" stroke="url(#ck-leg)" strokeWidth="1.7" fill="none" strokeLinecap="round" />
                    </g>

                    {/* RIGHT MIDDLE */}
                    <g className={isWiggling ? 'leg-spasm' : ''} style={{ transformOrigin: '132px 163px', animationDelay: '0.01s' }}>
                        <path d="M132 163 Q 163 161, 186 172" stroke="url(#ck-leg)" strokeWidth="3.6" fill="none" strokeLinecap="round" />
                        <line x1="156" y1="162" x2="158" y2="155" stroke="#380E04" strokeWidth="1.5" />
                        <line x1="173" y1="165" x2="175" y2="158" stroke="#380E04" strokeWidth="1.5" />
                        <path d="M186 172 Q 196 177, 201 183" stroke="url(#ck-leg)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                        <path d="M201 183 Q 206 188, 208 193" stroke="url(#ck-leg)" strokeWidth="1.7" fill="none" strokeLinecap="round" />
                    </g>

                    {/* LEFT FRONT */}
                    <g className={isWiggling ? 'leg-spasm' : ''} style={{ transformOrigin: '73px 124px', animationDelay: '0.02s' }}>
                        <path d="M73 124 Q 44 110, 22 93" stroke="url(#ck-leg)" strokeWidth="3" fill="none" strokeLinecap="round" />
                        <line x1="54"  y1="115" x2="52"  y2="108" stroke="#380E04" strokeWidth="1.4" />
                        <line x1="38"  y1="104" x2="36"  y2="97"  stroke="#380E04" strokeWidth="1.4" />
                        <path d="M22  93  Q 12  84,  7 75"  stroke="url(#ck-leg)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                        <path d="M7   75  Q  3  68,  1 62"  stroke="url(#ck-leg)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                    </g>

                    {/* RIGHT FRONT */}
                    <g className={isWiggling ? 'leg-spasm' : ''} style={{ transformOrigin: '127px 124px', animationDelay: '0.05s' }}>
                        <path d="M127 124 Q 156 110, 178 93"  stroke="url(#ck-leg)" strokeWidth="3"   fill="none" strokeLinecap="round" />
                        <line x1="146" y1="115" x2="148" y2="108" stroke="#380E04" strokeWidth="1.4" />
                        <line x1="162" y1="104" x2="164" y2="97"  stroke="#380E04" strokeWidth="1.4" />
                        <path d="M178  93  Q 188  84, 193 75"  stroke="url(#ck-leg)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                        <path d="M193  75  Q 197  68, 199 62"  stroke="url(#ck-leg)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                    </g>

                    {/* ===== ABDOMEN ===== */}
                    <ellipse cx="100" cy="185" rx="45" ry="90" fill="url(#ck-body)" />

                    {/* Segment lines */}
                    <line x1="60"  y1="163" x2="140" y2="163" stroke="#140604" strokeWidth="1.3" opacity="0.80" />
                    <line x1="57"  y1="183" x2="143" y2="183" stroke="#140604" strokeWidth="1.3" opacity="0.80" />
                    <line x1="58"  y1="203" x2="142" y2="203" stroke="#140604" strokeWidth="1.3" opacity="0.78" />
                    <line x1="61"  y1="221" x2="139" y2="221" stroke="#140604" strokeWidth="1.2" opacity="0.72" />
                    <line x1="67"  y1="238" x2="133" y2="238" stroke="#140604" strokeWidth="1.1" opacity="0.60" />

                    {/* Wing median cleft */}
                    <line x1="100" y1="118" x2="100" y2="264" stroke="#0C0402" strokeWidth="2.2" opacity="0.75" />

                    {/* Wing venation – left */}
                    <path d="M100 132 L 84 150 L 68 175 L 64 205 L 66 228" stroke="#0C0402" strokeWidth="1.0" fill="none" opacity="0.55" />
                    <path d="M100 148 L 80 170 L 64 198"                     stroke="#0C0402" strokeWidth="0.8" fill="none" opacity="0.42" />
                    <path d="M100 165 L 76 185 L 63 218"                     stroke="#0C0402" strokeWidth="0.7" fill="none" opacity="0.36" />
                    <line x1="81" y1="157" x2="86"  y2="165" stroke="#0C0402" strokeWidth="0.7" opacity="0.36" />
                    <line x1="74" y1="178" x2="78"  y2="187" stroke="#0C0402" strokeWidth="0.6" opacity="0.32" />
                    <line x1="70" y1="200" x2="73"  y2="210" stroke="#0C0402" strokeWidth="0.6" opacity="0.28" />
                    {/* Wing venation – right */}
                    <path d="M100 132 L 116 150 L 132 175 L 136 205 L 134 228" stroke="#0C0402" strokeWidth="1.0" fill="none" opacity="0.55" />
                    <path d="M100 148 L 120 170 L 136 198"                      stroke="#0C0402" strokeWidth="0.8" fill="none" opacity="0.42" />
                    <path d="M100 165 L 124 185 L 137 218"                      stroke="#0C0402" strokeWidth="0.7" fill="none" opacity="0.36" />
                    <line x1="119" y1="157" x2="114" y2="165" stroke="#0C0402" strokeWidth="0.7" opacity="0.36" />
                    <line x1="126" y1="178" x2="122" y2="187" stroke="#0C0402" strokeWidth="0.6" opacity="0.32" />
                    <line x1="130" y1="200" x2="127" y2="210" stroke="#0C0402" strokeWidth="0.6" opacity="0.28" />

                    {/* Chitin gloss */}
                    <ellipse cx="85" cy="167" rx="19" ry="40" fill="url(#ck-gloss)" />

                    {/* Cerci */}
                    <path d="M88 263 Q 80 274, 75 283" stroke="url(#ck-cerci)" strokeWidth="3"   fill="none" strokeLinecap="round" />
                    <path d="M75 283 Q 71 289, 70 294" stroke="url(#ck-cerci)" strokeWidth="2"   fill="none" strokeLinecap="round" />
                    <path d="M112 263 Q 120 274, 125 283" stroke="url(#ck-cerci)" strokeWidth="3"   fill="none" strokeLinecap="round" />
                    <path d="M125 283 Q 129 289, 130 294" stroke="url(#ck-cerci)" strokeWidth="2"   fill="none" strokeLinecap="round" />
                    {/* cerci micro-hairs */}
                    <line x1="73" y1="286" x2="70"  y2="291" stroke="#4A1608" strokeWidth="1.1" />
                    <line x1="69" y1="290" x2="66"  y2="295" stroke="#4A1608" strokeWidth="1" />
                    <line x1="127" y1="286" x2="130" y2="291" stroke="#4A1608" strokeWidth="1.1" />
                    <line x1="131" y1="290" x2="134" y2="295" stroke="#4A1608" strokeWidth="1" />

                    {/* ===== PRONOTUM (shield plate) ===== */}
                    <path d="M60 107 Q 100 90, 140 107 L 136 137 Q 100 144, 64 137 Z" fill="url(#ck-pronot)" />
                    {/* pronotum gloss */}
                    <ellipse cx="89" cy="114" rx="22" ry="13" fill="url(#ck-gloss)" opacity="0.75" />
                    {/* pronotum edge */}
                    <path d="M60 107 Q 100 90, 140 107" stroke="#0A0402" strokeWidth="1.3" fill="none" opacity="0.7" />
                    {/* mid notch */}
                    <line x1="100" y1="90" x2="100" y2="96" stroke="#0A0402" strokeWidth="0.9" opacity="0.5" />

                    {/* ===== HEAD ===== */}
                    <ellipse cx="100" cy="91" rx="17" ry="19" fill="url(#ck-head)" />
                    {/* clypeus */}
                    <ellipse cx="100" cy="103" rx="11" ry="8" fill="#3C1408" opacity="0.75" />

                    {/* Compound eyes */}
                    <ellipse cx="87" cy="85" rx="7" ry="9" fill="url(#ck-eye-dark)" />
                    <ellipse cx="113" cy="85" rx="7" ry="9" fill="url(#ck-eye-dark)" />
                    {/* facet shimmer */}
                    <ellipse cx="86"  cy="83" rx="2.8" ry="3.2" fill="rgba(60,160,90,0.55)" />
                    <ellipse cx="112" cy="83" rx="2.8" ry="3.2" fill="rgba(60,160,90,0.55)" />
                    {/* specular */}
                    <circle cx="85.5" cy="82" r="1.1" fill="rgba(255,255,255,0.38)" />
                    <circle cx="111.5" cy="82" r="1.1" fill="rgba(255,255,255,0.38)" />

                    {/* Mandibles */}
                    <path d="M93 106 Q 87 114, 84 120" stroke="#280C04" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                    <path d="M84 120 Q 82 124, 83 127"  stroke="#280C04" strokeWidth="2"   fill="none" strokeLinecap="round" />
                    <circle cx="83" cy="127" r="2"  fill="#1A0804" />
                    <path d="M107 106 Q 113 114, 116 120" stroke="#280C04" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                    <path d="M116 120 Q 118 124, 117 127" stroke="#280C04" strokeWidth="2"   fill="none" strokeLinecap="round" />
                    <circle cx="117" cy="127" r="2" fill="#1A0804" />

                    {/* Palps (feelers near mouth) */}
                    <path d="M89 112 Q 83 118, 80 123" stroke="#3A1408" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                    <path d="M111 112 Q 117 118, 120 123" stroke="#3A1408" strokeWidth="1.4" fill="none" strokeLinecap="round" />

                    {/* ===== ANTENNAE ===== */}
                    <g className={isWiggling ? 'antenna-thrash' : ''} style={{ transformOrigin: '91px 79px' }}>
                        <path d="M91 79 C 72 56, 44 40, 20 10" stroke="#240C04" strokeWidth="1.4" fill="none" />
                        <circle cx="74"  cy="62" r="0.9" fill="#4C1808" />
                        <circle cx="57"  cy="49" r="0.9" fill="#4C1808" />
                        <circle cx="40"  cy="35" r="0.9" fill="#4C1808" />
                        <circle cx="28"  cy="21" r="0.9" fill="#4C1808" />
                        <circle cx="20"  cy="10" r="0.9" fill="#4C1808" />
                    </g>
                    <g className={isWiggling ? 'antenna-thrash' : ''} style={{ transformOrigin: '109px 79px', animationDelay: '0.024s' }}>
                        <path d="M109 79 C 128 56, 156 40, 180 10" stroke="#240C04" strokeWidth="1.4" fill="none" />
                        <circle cx="126" cy="62" r="0.9" fill="#4C1808" />
                        <circle cx="143" cy="49" r="0.9" fill="#4C1808" />
                        <circle cx="160" cy="35" r="0.9" fill="#4C1808" />
                        <circle cx="172" cy="21" r="0.9" fill="#4C1808" />
                        <circle cx="180" cy="10" r="0.9" fill="#4C1808" />
                    </g>

                </g>
            </svg>
        </div>
    );
};

export default function CockroachPage() {
    const [isWiggling, setIsWiggling] = useState(false);
    const [count, setCount] = useState(0);

    const startWiggle = useCallback(() => {
        if (isWiggling) return;
        setIsWiggling(true);
        setCount(prev => prev + 1);
        setTimeout(() => setIsWiggling(false), 600);
    }, [isWiggling]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') { e.preventDefault(); startWiggle(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [startWiggle]);

    return (
        <div className="flex flex-col min-h-dvh bg-[#020202] text-zinc-100 overflow-hidden font-['Inter',sans-serif]">
            {/* bg noise */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

            {/* Header */}
            <header className="relative z-20 w-full flex items-center justify-between px-6 h-16 border-b border-zinc-900 bg-black/80 backdrop-blur-md">
                <Link href="/" className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] tracking-[0.2em] uppercase font-black">뒤로</span>
                </Link>
                <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800">
                    <div className={`w-2 h-2 rounded-full transition-colors ${isWiggling ? 'bg-red-500 animate-ping' : 'bg-emerald-600'}`} />
                    <span className="text-[9px] tracking-widest uppercase font-bold text-zinc-400">Live · P. americana</span>
                </div>
            </header>

            {/* Main */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
                {/* hazard badge */}
                <div className="absolute top-8 flex flex-col items-center gap-2 opacity-35">
                    <AlertTriangle size={22} className="text-amber-600" />
                    <span className="text-[9px] tracking-[0.4em] uppercase text-zinc-500">생물학적 위험</span>
                </div>

                {/* cockroach */}
                <div
                    onClick={startWiggle}
                    className="relative cursor-pointer transition-transform active:scale-90"
                >
                    <RealisticCockroach isWiggling={isWiggling} />

                    {!isWiggling && count === 0 && (
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-zinc-600 animate-bounce tracking-tighter whitespace-nowrap">
                            눌러서 도발
                        </div>
                    )}
                </div>

                {/* counter */}
                <div className="mt-10 text-center space-y-1">
                    <div className="text-[10px] tracking-[0.5em] uppercase text-zinc-600 font-bold">발작 횟수</div>
                    <div
                        className="text-6xl font-black tracking-tighter transition-colors duration-75"
                        style={{ color: isWiggling ? ACCENT : '#27272a' }}
                    >
                        {count.toLocaleString()}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-20 w-full px-6 py-8 border-t border-zinc-900 bg-black/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-[9px] text-zinc-600 tracking-[0.2em] uppercase font-medium order-2 md:order-1">
                    바퀴벌레 공포 극복 트레이닝 (효과 없음)
                </div>
                <div className="flex items-center gap-6 order-1 md:order-2">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] text-zinc-500 uppercase tracking-widest">입력</span>
                        <span className="text-[10px] text-zinc-300 font-bold uppercase">클릭 / 스페이스</span>
                    </div>
                    <div className="w-[1px] h-8 bg-zinc-800" />
                    <div className="flex flex-col items-start">
                        <span className="text-[8px] text-zinc-500 uppercase tracking-widest">상태</span>
                        <span
                            className="text-[10px] font-bold uppercase transition-colors duration-75"
                            style={{ color: isWiggling ? ACCENT : '#52525b' }}
                        >
                            {isWiggling ? '발작 중' : '잠복 중'}
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
