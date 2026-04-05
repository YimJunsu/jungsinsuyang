'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Grid3X3 } from 'lucide-react';

export default function PrisonPage() {
    const [blocks] = useState(Array.from({ length: 400 }));

    return (
        <div className="min-h-dvh bg-[#050505] flex flex-col items-center justify-center p-4 overflow-hidden relative">
            <Link href="/" className="absolute top-8 left-8 p-4 bg-white/5 border border-white/10 rounded-full z-50">
                <ArrowLeft className="text-zinc-500 hover:text-white transition-colors" size={24} />
            </Link>

            <div className="relative grid grid-cols-10 md:grid-cols-20 gap-1 opacity-40">
                {blocks.map((_, i) => (
                    <div
                        key={i}
                        className="w-6 h-6 md:w-8 md:h-8 border border-zinc-800 rounded-sm transition-all duration-700
                       hover:bg-zinc-100 hover:scale-150 hover:rotate-45 hover:z-10 hover:border-white shadow-2xl group"
                    >
                        <div className="w-full h-full opacity-0 group-hover:opacity-100 bg-white/20 blur-sm transition-opacity" />
                    </div>
                ))}
            </div>

            <div className="mt-16 text-center z-10 pointer-events-none">
                <Grid3X3 className="mx-auto text-zinc-700 mb-4" size={32} />
                <p className="text-zinc-600 text-[10px] tracking-[0.5em] uppercase leading-relaxed">
                    격자를 벗어나려는 시도는<br />
                    결국 또 다른 격자를 만든다
                </p>
            </div>

            {/* 배경 글로우 */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
        </div>
    );
}