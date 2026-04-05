'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Droplets, ArrowLeft } from 'lucide-react';

const COLORS = [
    { name: 'Gold', value: '#d4af37' },
    { name: 'Ash', value: '#8e8e8e' },
    { name: 'Blood', value: '#8b0000' },
    { name: 'Void', value: '#2d004d' },
];

export default function SandPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentColor, setCurrentColor] = useState(COLORS[0].value);
    const grid = useRef<string[][]>([]);
    const width = 200; // 시뮬레이션 해상도
    const height = 150;

    // 그리드 초기화
    useEffect(() => {
        grid.current = Array.from({ length: height }, () => Array(width).fill(null));

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = () => {
            // 1. 새로운 모래 생성 (중앙 상단)
            const centerX = Math.floor(width / 2);
            for(let i = -2; i <= 2; i++) {
                if (Math.random() > 0.5) grid.current[0][centerX + i] = currentColor;
            }

            // 2. 물리 연산 (역순으로 계산해야 자연스러움)
            for (let y = height - 2; y >= 0; y--) {
                for (let x = 0; x < width; x++) {
                    const current = grid.current[y][x];
                    if (current) {
                        if (!grid.current[y + 1][x]) { // 바로 아래가 비었으면 이동
                            grid.current[y + 1][x] = current;
                            grid.current[y][x] = null;
                        } else { // 대각선 이동 (산 모양 형성)
                            const dir = Math.random() > 0.5 ? 1 : -1;
                            if (x + dir >= 0 && x + dir < width && !grid.current[y + 1][x + dir]) {
                                grid.current[y + 1][x + dir] = current;
                                grid.current[y][x] = null;
                            }
                        }
                    }
                }
            }

            // 3. 그리기
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cellW = canvas.width / width;
            const cellH = canvas.height / height;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (grid.current[y][x]) {
                        ctx.fillStyle = grid.current[y][x]!;
                        ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
                    }
                }
            }
            requestAnimationFrame(render);
        };

        const animId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animId);
    }, [currentColor]);

    return (
        <div className="relative w-full h-dvh bg-[#050505] overflow-hidden flex flex-col items-center justify-center">
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full h-full object-cover opacity-80"
            />

            {/* UI Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none">
                <div className="flex justify-between items-start pointer-events-auto">
                    <Link href="/" className="p-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft className="text-white" size={24} />
                    </Link>
                    <div className="text-right">
                        <h1 className="text-white text-4xl font-black italic tracking-tighter uppercase opacity-20">Infinite Sand</h1>
                        <p className="text-zinc-500 text-xs tracking-widest mt-2 uppercase">Time is falling away</p>
                    </div>
                </div>

                {/* Color Switcher */}
                <div className="flex flex-col items-center gap-6 pointer-events-auto">
                    <div className="flex gap-4 bg-black/40 p-3 rounded-3xl border border-white/5 backdrop-blur-xl">
                        {COLORS.map((c) => (
                            <button
                                key={c.name}
                                onClick={() => setCurrentColor(c.value)}
                                className={`w-10 h-10 rounded-full border-2 transition-all ${currentColor === c.value ? 'scale-125 border-white' : 'border-transparent opacity-50'}`}
                                style={{ backgroundColor: c.value }}
                                title={c.name}
                            />
                        ))}
                    </div>
                    <button
                        onClick={() => grid.current = Array.from({ length: height }, () => Array(width).fill(null))}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] uppercase tracking-widest"
                    >
                        <RotateCcw size={14} /> Reset Void
                    </button>
                </div>
            </div>
        </div>
    );
}