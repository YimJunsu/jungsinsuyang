'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Flame } from 'lucide-react';

export default function CandlePage() {
    const [isSteady, setIsSteady] = useState(false);
    const mousePos = useRef({ x: 0, y: 0 });
    const lastMousePos = useRef({ x: 0, y: 0 });
    const [flicker, setFlicker] = useState(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);

        const interval = setInterval(() => {
            // 마우스 이동 속도 계산
            const dist = Math.sqrt(
                Math.pow(mousePos.current.x - lastMousePos.current.x, 2) +
                Math.pow(mousePos.current.y - lastMousePos.current.y, 2)
            );

            setFlicker(dist > 5 ? dist * 0.5 : Math.random() * 2);
            setIsSteady(dist < 1);
            lastMousePos.current = { ...mousePos.current };
        }, 100);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="min-h-dvh bg-[#020202] flex flex-col items-center justify-center overflow-hidden relative">
            <Link href="/" className="absolute top-8 left-8 p-4 bg-white/5 border border-white/10 rounded-full z-50">
                <ArrowLeft className="text-white" size={24} />
            </Link>

            {/* 촛불 몸체 */}
            <div className="relative flex flex-col items-center">
                {/* 심지 */}
                <div className="w-1 h-4 bg-zinc-800 rounded-full mb-[-4px]" />

                {/* 불꽃 */}
                <div
                    className="relative transition-transform duration-300 ease-out"
                    style={{
                        transform: `rotate(${(mousePos.current.x - lastMousePos.current.x) * 0.5}deg) scale(${1 + flicker * 0.01})`,
                        filter: `blur(${flicker * 0.2}px)`
                    }}
                >
                    {/* 안쪽 불꽃 */}
                    <div className="w-8 h-12 bg-orange-400 rounded-full blur-[2px] animate-pulse" />
                    {/* 바깥 광원 */}
                    <div
                        className="absolute inset-0 w-16 h-24 bg-orange-600/30 rounded-full blur-2xl -translate-x-1/4 -translate-y-1/4 transition-opacity duration-1000"
                        style={{ opacity: isSteady ? 0.8 : 0.4 }}
                    />
                </div>

                {/* 양초 본체 */}
                <div className="w-12 h-40 bg-gradient-to-b from-zinc-200 to-zinc-400 rounded-t-sm shadow-xl" />
            </div>

            {/* 명언 메시지 */}
            <div className={`mt-20 text-zinc-500 text-sm tracking-[0.3em] uppercase transition-all duration-1000 ${isSteady ? 'opacity-40 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                흔들리는 것은 당신의 마음뿐이다
            </div>

            {/* 전체 화면 어둡기 조절 */}
            <div className="fixed inset-0 pointer-events-none transition-opacity duration-1000 bg-orange-950/5"
                 style={{ opacity: isSteady ? 1 : 0 }} />
        </div>
    );
}