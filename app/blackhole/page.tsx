'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Thought {
    id: number;
    text: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
}

export default function BlackHolePage() {
    const [inputText, setInputText] = useState('');
    const [thoughts, setThoughts] = useState<Thought[]>([]);
    const nextId = useRef(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newThought: Thought = {
            id: nextId.current++,
            text: inputText,
            x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
            y: window.innerHeight / 2 - 200,
            scale: 1,
            rotation: 0,
        };

        setThoughts(prev => [...prev, newThought]);
        setInputText('');
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setThoughts(prev =>
                prev.map(t => {
                    // 블랙홀 중심 좌표
                    const centerX = window.innerWidth / 2;
                    const centerY = window.innerHeight / 2;

                    // 중심과의 거리 계산
                    const dx = centerX - t.x;
                    const dy = centerY - t.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // 빨려 들어가는 물리 법칙
                    return {
                        ...t,
                        x: t.x + dx * 0.05 + Math.cos(t.rotation) * 5,
                        y: t.y + dy * 0.05 + Math.sin(t.rotation) * 5,
                        scale: t.scale * 0.96,
                        rotation: t.rotation + 0.2,
                    };
                }).filter(t => t.scale > 0.05)
            );
        }, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-dvh bg-[#020205] overflow-hidden flex flex-col items-center justify-center font-mono">
            {/* 배경 별무리 */}
            <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }} />

            {/* 블랙홀 코어 */}
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* 아우라 효과 */}
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-[60px] animate-pulse" />
                <div className="absolute inset-4 rounded-full bg-purple-900/40 blur-[30px] animate-spin-slow" />
                {/* 중심부 */}
                <div className="absolute inset-20 rounded-full bg-black shadow-[0_0_40px_rgba(255,255,255,0.1)] border border-white/5" />
            </div>

            {/* 입력창 */}
            <div className="absolute bottom-20 w-full max-w-md px-6 z-50">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="사라지게 하고 싶은 고민을 적으세요..."
                        className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-md transition-all"
                    />
                    <button className="absolute right-2 top-2 bottom-2 px-6 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm transition-colors">
                        전송
                    </button>
                </form>
            </div>

            {/* 빨려 들어가는 텍스트들 */}
            {thoughts.map(t => (
                <div
                    key={t.id}
                    className="absolute text-white font-bold whitespace-nowrap pointer-events-none"
                    style={{
                        left: t.x,
                        top: t.y,
                        transform: `translate(-50%, -50%) rotate(${t.rotation}rad) scale(${t.scale})`,
                        opacity: t.scale,
                        textShadow: '0 0 10px rgba(168, 85, 247, 0.8)'
                    }}
                >
                    {t.text}
                </div>
            ))}

            {/* 뒤로가기 */}
            <Link href="/" className="absolute top-6 left-6 z-50 text-white/30 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </Link>

            <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
        </div>
    );
}