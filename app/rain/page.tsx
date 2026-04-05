'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RainPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let drops: any[] = [];

        class Drop {
            x: number; y: number; size: number; speed: number;
            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * -canvas!.height;
                this.size = Math.random() * 2 + 1;
                this.speed = Math.random() * 5 + 2;
            }
            update() {
                this.y += this.speed;
                if (this.y > canvas!.height) {
                    this.y = -20;
                    this.x = Math.random() * canvas!.width;
                }
            }
            draw() {
                ctx!.beginPath();
                ctx!.moveTo(this.x, this.y);
                ctx!.lineTo(this.x, this.y + this.size * 5);
                ctx!.strokeStyle = 'rgba(173, 216, 230, 0.2)';
                ctx!.stroke();
            }
        }

        for (let i = 0; i < 150; i++) drops.push(new Drop());

        const animate = () => {
            ctx.fillStyle = 'rgba(2, 2, 2, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drops.forEach(drop => {
                drop.update();
                drop.draw();
            });
            requestAnimationFrame(animate);
        };

        animate();
    }, []);

    return (
        <div className="relative w-full h-dvh bg-[#020202] overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none" />

            <Link href="/" className="absolute top-8 left-8 p-4 bg-white/5 border border-white/10 rounded-full z-50">
                <ArrowLeft className="text-white" size={24} />
            </Link>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <h1 className="text-zinc-800 text-[15vw] font-black uppercase opacity-20 select-none">SOLITUDE</h1>
            </div>
        </div>
    );
}