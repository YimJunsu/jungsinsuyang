'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const BACKGROUND_IMAGES = [
    'https://images.unsplash.com/photo-1542641728-6ca359b085f4?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501854140801-50d01674aa3e?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2000&auto=format&fit=crop',
];

interface Crack { id: number; x: number; y: number; rotate: number; size: number; }
interface Particle { id: number; x: number; y: number; vx: number; vy: number; size: number; opacity: number; }

export default function SmashPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [bgImage, setBgImage] = useState('');
    const [cracks, setCracks] = useState<Crack[]>([]);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [shake, setShake] = useState(false);
    const [isFull, setIsFull] = useState(false);
    const nextId = useRef(0);

    useEffect(() => {
        setBgImage(BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)]);

        // 전체화면 상태 감지 이벤트
        const handleFullChange = () => setIsFull(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullChange);
        return () => document.removeEventListener('fullscreenchange', handleFullChange);
    }, []);

    const handleSmash = (e: React.MouseEvent | React.TouchEvent) => {
        // ─── 전체화면 트리거 (첫 클릭 시 실행) ───
        if (!document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen().catch(() => {
                /* 브라우저 거부 시 무시 */
            });
        }

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const newCrack: Crack = {
            id: nextId.current++,
            x: clientX,
            y: clientY,
            rotate: Math.random() * 360,
            size: 50 + Math.random() * 70,
        };

        const newParticles: Particle[] = Array.from({ length: 12 }).map(() => ({
            id: nextId.current++,
            x: clientX,
            y: clientY,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            size: Math.random() * 5 + 2,
            opacity: 1,
        }));

        setCracks(prev => [...prev, newCrack].slice(-50));
        setParticles(prev => [...prev, ...newParticles]);
        setShake(true);
        setTimeout(() => setShake(false), 80);
    };

    useEffect(() => {
        if (particles.length === 0) return;
        const interval = setInterval(() => {
            setParticles(prev =>
                prev.map(p => ({
                    ...p,
                    x: p.x + p.vx, y: p.y + p.vy,
                    vy: p.vy + 0.8, opacity: p.opacity - 0.03,
                })).filter(p => p.opacity > 0 && p.y < window.innerHeight)
            );
        }, 16);
        return () => clearInterval(interval);
    }, [particles]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-dvh overflow-hidden select-none touch-none bg-black ${shake ? 'animate-shake' : ''}`}
            onMouseDown={handleSmash}
            style={{
                backgroundImage: bgImage ? `url('${bgImage}')` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* 상단바 (전체화면 시 숨김 가능하지만 컨트롤러용으로 유지) */}
            <div className="absolute top-6 left-6 z-50 flex items-center gap-4 transition-opacity duration-500 hover:opacity-100 opacity-40">
                <Link href="/" onClick={(e) => e.stopPropagation()} className="bg-black/50 p-3 rounded-full backdrop-blur-xl border border-white/20">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </Link>
                <div className="px-4 py-2 bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl">
                    <span className="text-[#00ff41] font-mono font-bold text-sm">CRASHED: {cracks.length}</span>
                </div>
            </div>

            {/* 안내 메시지 */}
            {cracks.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/20">
                    <div className="text-white text-5xl mb-4 animate-bounce">🔨</div>
                    <p className="text-white font-bold text-xl drop-shadow-lg">
                        클릭하여 스트레스를 부수세요!
                    </p>
                    <p className="text-white/60 text-sm mt-2">
                        (첫 클릭 시 자동으로 전체화면이 됩니다)
                    </p>
                </div>
            )}

            {/* 전체화면 종료 안내 (전체화면일 때만 살짝 표시) */}
            {isFull && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 opacity-20 hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-white text-[10px] uppercase tracking-widest">ESC를 누르면 전체화면이 종료됩니다</span>
                </div>
            )}

            {/* Crack & Particle Layers */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                {cracks.map(crack => (
                    <div key={crack.id} className="absolute" style={{ left: crack.x, top: crack.y, width: crack.size * 2, height: crack.size * 2, transform: `translate(-50%, -50%) rotate(${crack.rotate}deg)` }}>
                        <div className="absolute inset-0 opacity-80" style={{
                            background: `radial-gradient(circle at center, rgba(255,255,255,0.5) 0%, transparent 10%), conic-gradient(from 0deg at 50% 50%, transparent 0%, white 0.3%, transparent 0.6%, transparent 20%, white 20.3%, transparent 20.6%, transparent 50%, white 50.3%, transparent 50.6%, transparent 80%, white 80.3%, transparent 80.6%)`,
                            maskImage: 'radial-gradient(circle at center, black 0%, transparent 90%)'
                        }} />
                    </div>
                ))}
            </div>

            <div className="absolute inset-0 z-30 pointer-events-none">
                {particles.map(p => (
                    <div key={p.id} className="absolute bg-white/80 shadow-[0_0_10px_white]" style={{ left: p.x, top: p.y, width: p.size, height: p.size, opacity: p.opacity, clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
                ))}
            </div>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translate(0,0); }
                    25% { transform: translate(-5px, 5px); }
                    50% { transform: translate(5px, -5px); }
                    75% { transform: translate(-3px, -3px); }
                }
                .animate-shake { animation: shake 0.08s ease-in-out; }
            `}</style>
        </div>
    );
}