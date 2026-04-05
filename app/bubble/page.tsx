'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Bubble {
    id: number;
    isPopped: boolean;
}

export default function BubbleWrapPage() {
    const [bubbles, setBubbles] = useState<Bubble[]>([]);
    const [popCount, setPopCount] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 1. 초기 뽁뽁이 생성 (화면 크기에 맞게)
    const resetBubbles = useCallback(() => {
        const rows = 10;
        const cols = 6;
        const newBubbles = Array.from({ length: rows * cols }, (_, i) => ({
            id: i,
            isPopped: false,
        }));
        setBubbles(newBubbles);
    }, []);

    useEffect(() => {
        resetBubbles();
    }, [resetBubbles]);

    // 2. 톡 터뜨리는 함수
    const handlePop = (id: number) => {
        setBubbles(prev => {
            const target = prev.find(b => b.id === id);
            if (target?.isPopped) return prev; // 이미 터진 건 무시

            // 소리 재생
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => {});
            }

            // 모바일 진동 (지원되는 브라우저만)
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }

            setPopCount(c => c + 1);

            const next = prev.map(b => b.id === id ? { ...b, isPopped: true } : b);

            // 모든 뽁뽁이가 터졌는지 확인 후 리셋
            if (next.every(b => b.isPopped)) {
                setTimeout(resetBubbles, 500);
            }

            return next;
        });
    };

    return (
        <div className="min-h-dvh bg-slate-100 flex flex-col items-center py-10 px-4 select-none">
            {/* 효과음 엘리먼트 (public/sounds/pop.mp3 경로에 파일 필요) */}
            <audio ref={audioRef} src="/sounds/pop.mp3" preload="auto" />

            {/* 헤더 */}
            <div className="w-full max-w-md flex items-center justify-between mb-8 z-10">
                <Link href="/" className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 active:scale-90 transition-transform">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </Link>
                <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-slate-200">
                    <span className="text-slate-500 font-bold text-sm">POPPED: </span>
                    <span className="text-blue-500 font-black text-lg">{popCount.toLocaleString()}</span>
                </div>
            </div>

            {/* 뽁뽁이 판 */}
            <div className="bg-white/50 p-4 rounded-[2rem] border-4 border-white shadow-xl backdrop-blur-sm relative overflow-hidden">
                {/* 비닐 질감 오버레이 */}
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/plastic-bubble.png')]" />

                <div className="grid grid-cols-6 gap-3 relative z-10">
                    {bubbles.map(bubble => (
                        <div
                            key={bubble.id}
                            onMouseDown={() => handlePop(bubble.id)}
                            onTouchStart={(e) => {
                                e.preventDefault();
                                handlePop(bubble.id);
                            }}
                            className={`
                w-12 h-12 rounded-full cursor-pointer transition-all duration-75
                ${bubble.isPopped
                                ? 'bg-slate-200/50 shadow-inner scale-95'
                                : 'bg-gradient-to-br from-blue-100 to-blue-300 shadow-[0_4px_0_0_#93c5fd,0_8px_15px_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none'
                            }
              `}
                        >
                            {/* 뽁뽁이 안쪽 하이라이트 */}
                            {!bubble.isPopped && (
                                <div className="w-4 h-4 bg-white/40 rounded-full mt-1 ml-2 blur-[1px]" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-10 text-slate-400 text-xs font-medium text-center leading-relaxed">
                터뜨릴 때마다 스트레스가 0.1%씩 감소합니다.<br/>
                모두 터뜨리면 자동으로 새 판이 깔립니다.
            </div>

            {/* 애니메이션 효과용 CSS */}
            <style jsx>{`
        .shadow-inner {
          box-shadow: inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.8);
        }
      `}</style>
        </div>
    );
}