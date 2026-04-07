'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Cigarette geometry (px) ─────────────────────────── */
const CIGA_W     = 26;
const BODY_H     = 190;
const EMBER_H    = 13;
const BAND_H     = 6;
const FILTER_H   = 84;
const CIGA_TOTAL = BODY_H + EMBER_H + BAND_H + FILTER_H; // 293
const BAND_TOP   = BODY_H + EMBER_H;          // 203
const FILTER_TOP = BODY_H + EMBER_H + BAND_H; // 209

const TOTAL_BURN_SECONDS = 120; // 2 minutes total
const ASH_DROP_TRIGGER   = 36;  // px of visible ash before drop

/* ─── Types ───────────────────────────────────────────── */
interface Particle {
    x: number; y: number;
    vx: number; vy: number;
    size: number; maxSize: number;
    life: number; maxLife: number;
    baseOpacity: number;
    turbPhase: number; turbAmp: number;
}

interface AshDrop {
    x: number; y: number;
    vx: number; vy: number;
    w: number; h: number;
    rot: number; rotV: number;
    opacity: number;
}

/* ═══════════════════════════════════════════════════════ */
export default function SmokingContent() {
    const [burnProgress, setBurnProgress] = useState(0);
    const [isActive,     setIsActive]     = useState(false);
    const [isDone,       setIsDone]       = useState(false);
    const [isMuted,      setIsMuted]      = useState(false);
    const [ashDropped,   setAshDropped]   = useState(0);
    const [shareState,   setShareState]   = useState<'idle' | 'done' | 'copied'>('idle');

    /* burn state refs */
    const burnedRef      = useRef(0);
    const bpRef          = useRef(0);
    const isActiveRef    = useRef(false);
    const isDoneRef      = useRef(false);
    const mutedRef       = useRef(false);
    const lastBurnTsRef  = useRef(0);
    const burnRafRef     = useRef<number>(0);

    /* ash dropping */
    const ashDroppedRef  = useRef(0);
    const ashDropsRef    = useRef<AshDrop[]>([]);
    const ashDropLockRef = useRef(false); // cooldown between drops

    /* audio */
    const audioCtxRef    = useRef<AudioContext | null>(null);
    const crackleGainRef = useRef<GainNode | null>(null);
    const audioSetupRef  = useRef(false);

    /* canvas / particles */
    const canvasRef      = useRef<HTMLCanvasElement>(null);
    const containerRef   = useRef<HTMLDivElement>(null);
    const particlesRef   = useRef<Particle[]>([]);
    const smokeRafRef    = useRef<number>(0);
    const lastSmokeTsRef = useRef(0);
    const spawnAccRef    = useRef(0);
    const hazeRef        = useRef(0);

    /* ── Audio helpers ─────────────────────────────────── */

    /* Get/create AudioContext and unlock for iOS */
    const getCtx = useCallback((): AudioContext | null => {
        try {
            if (!audioCtxRef.current) {
                type Win = typeof window & { webkitAudioContext?: typeof AudioContext };
                const Ctx = window.AudioContext || (window as Win).webkitAudioContext;
                if (!Ctx) return null;
                const ctx = new Ctx();
                audioCtxRef.current = ctx;

                /* iOS silent-buffer unlock */
                const silent = ctx.createBuffer(1, 1, ctx.sampleRate);
                const unlock = ctx.createBufferSource();
                unlock.buffer = silent;
                unlock.connect(ctx.destination);
                unlock.start(0);
            }
            if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume().catch(() => {});
            }
            return audioCtxRef.current;
        } catch { return null; }
    }, []);

    /* Setup looping crackle source (once per session) */
    const setupCrackle = useCallback((ctx: AudioContext) => {
        if (audioSetupRef.current) return;
        audioSetupRef.current = true;

        const sr  = ctx.sampleRate;
        const buf = ctx.createBuffer(1, sr * 2, sr);
        const d   = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

        const src = ctx.createBufferSource();
        src.buffer = buf; src.loop = true;

        const bp  = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 0.6;

        const hs  = ctx.createBiquadFilter();
        hs.type = 'highshelf'; hs.frequency.value = 6000; hs.gain.value = 8;

        const gain = ctx.createGain();
        gain.gain.value = 0;

        src.connect(bp); bp.connect(hs); hs.connect(gain);
        gain.connect(ctx.destination);
        src.start();
        crackleGainRef.current = gain;
    }, []);

    /* 치이익 — short sizzle/inhale burst */
    const playInhale = useCallback((ctx: AudioContext) => {
        if (mutedRef.current) return;
        const now = ctx.currentTime;
        const dur = 0.13 + Math.random() * 0.07;
        const len = Math.floor(ctx.sampleRate * dur);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d   = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
            const t   = i / ctx.sampleRate;
            const env = (1 - Math.exp(-t * 160)) * Math.exp(-t * 20);
            d[i] = (Math.random() * 2 - 1) * env;
        }
        const src = ctx.createBufferSource(); src.buffer = buf;
        const bp  = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 3800 + Math.random() * 600; bp.Q.value = 0.75;
        const hs  = ctx.createBiquadFilter();
        hs.type = 'highshelf'; hs.frequency.value = 5200; hs.gain.value = 7;
        const g   = ctx.createGain(); g.gain.value = 0.60;
        src.connect(bp); bp.connect(hs); hs.connect(g); g.connect(ctx.destination);
        src.start(now);
    }, []);

    /* 후- — soft breath exhale */
    const playExhale = useCallback((ctx: AudioContext) => {
        if (mutedRef.current) return;
        const now = ctx.currentTime;
        const dur = 0.55;
        const len = Math.floor(ctx.sampleRate * dur);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d   = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
            const t   = i / ctx.sampleRate;
            const env = Math.min(t / 0.04, 1) * Math.exp(-t * 4.8);
            d[i] = (Math.random() * 2 - 1) * env;
        }
        const src = ctx.createBufferSource(); src.buffer = buf;
        const lp  = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 700;
        const bp  = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 320; bp.Q.value = 0.5;
        const g   = ctx.createGain(); g.gain.value = 0.45;
        src.connect(lp); lp.connect(bp); bp.connect(g); g.connect(ctx.destination);
        src.start(now);
    }, []);

    /* ── Burn tick ─────────────────────────────────────── */
    const burnTick = useCallback((ts: number) => {
        if (!isActiveRef.current) return;
        if (lastBurnTsRef.current === 0) lastBurnTsRef.current = ts;
        const dt = Math.min((ts - lastBurnTsRef.current) / 1000, 0.08);
        lastBurnTsRef.current = ts;
        burnedRef.current = Math.min(burnedRef.current + dt, TOTAL_BURN_SECONDS);
        const p = burnedRef.current / TOTAL_BURN_SECONDS;
        bpRef.current = p;
        setBurnProgress(p);
        if (p >= 1) {
            isDoneRef.current  = true;
            isActiveRef.current = false;
            setIsDone(true);
            setIsActive(false);
            if (crackleGainRef.current && audioCtxRef.current) {
                crackleGainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.12);
            }
            return;
        }
        burnRafRef.current = requestAnimationFrame(burnTick);
    }, []);

    /* ── Start / Stop ──────────────────────────────────── */
    const startBurning = useCallback(() => {
        if (isDoneRef.current) return;

        /* Always get/unlock AudioContext in user-gesture handler */
        const ctx = getCtx();
        if (ctx) {
            setupCrackle(ctx);
            playInhale(ctx);
            crackleGainRef.current?.gain.setTargetAtTime(0.18, ctx.currentTime, 0.05);
        }

        isActiveRef.current = true;
        setIsActive(true);
        lastBurnTsRef.current = 0;
        burnRafRef.current = requestAnimationFrame(burnTick);
    }, [burnTick, getCtx, setupCrackle, playInhale]);

    const stopBurning = useCallback(() => {
        if (!isActiveRef.current) return;
        isActiveRef.current = false;
        setIsActive(false);
        cancelAnimationFrame(burnRafRef.current);

        const ctx = audioCtxRef.current;
        if (ctx) {
            playExhale(ctx);
            crackleGainRef.current?.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
        }
    }, [playExhale]);

    /* ── Keyboard ──────────────────────────────────────── */
    useEffect(() => {
        const onDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !e.repeat) { e.preventDefault(); startBurning(); }
        };
        const onUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') { e.preventDefault(); stopBurning(); }
        };
        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup',   onUp);
        return () => {
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup',   onUp);
        };
    }, [startBurning, stopBurning]);

    /* ── Reset ─────────────────────────────────────────── */
    const reset = useCallback(() => {
        cancelAnimationFrame(burnRafRef.current);
        burnedRef.current    = 0; bpRef.current      = 0;
        isActiveRef.current  = false; isDoneRef.current  = false;
        hazeRef.current      = 0; spawnAccRef.current = 0;
        particlesRef.current = []; ashDropsRef.current = [];
        ashDroppedRef.current = 0; ashDropLockRef.current = false;
        setBurnProgress(0); setIsActive(false);
        setIsDone(false);   setAshDropped(0);
        setShareState('idle');
        crackleGainRef.current?.gain.setTargetAtTime(
            0, audioCtxRef.current?.currentTime ?? 0, 0.1
        );
    }, []);

    /* ── Share ─────────────────────────────────────────── */
    const handleShare = useCallback(async () => {
        const url  = typeof window !== 'undefined' ? window.location.href : '';
        const text = '너도 한대 피울래? 🚬 가상 흡연으로 스트레스 날려버리기';
        if (navigator.share) {
            try {
                await navigator.share({ title: '정신수양 — 가상 흡연실', text, url });
                setShareState('done');
            } catch { /* user cancelled */ }
        } else {
            try {
                await navigator.clipboard.writeText(`${text}\n${url}`);
                setShareState('copied');
            } catch {
                setShareState('copied');
            }
        }
        setTimeout(() => setShareState('idle'), 3000);
    }, []);

    /* ── Mute toggle ───────────────────────────────────── */
    const toggleMute = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const next = !mutedRef.current;
        mutedRef.current = next;
        setIsMuted(next);
        if (crackleGainRef.current && audioCtxRef.current) {
            crackleGainRef.current.gain.setTargetAtTime(
                next ? 0 : (isActiveRef.current ? 0.18 : 0),
                audioCtxRef.current.currentTime, 0.06
            );
        }
    }, []);

    /* ── Canvas smoke + ash-drop loop ──────────────────── */
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

        const spawnParticle = (ex: number, ey: number, active: boolean) => {
            particlesRef.current.push({
                x: ex + (Math.random() - 0.5) * 8,
                y: ey,
                vx: (Math.random() - 0.5) * (active ? 22 : 9),
                vy: -(active ? 42 + Math.random() * 40 : 18 + Math.random() * 18),
                size:    5  + Math.random() * 6,
                maxSize: active ? 60 + Math.random() * 100 : 32 + Math.random() * 48,
                life: 1,
                maxLife: active ? 2.8 + Math.random() * 2.4 : 3.2 + Math.random() * 2.2,
                baseOpacity: active ? 0.55 + Math.random() * 0.25 : 0.22 + Math.random() * 0.12,
                turbPhase: Math.random() * Math.PI * 2,
                turbAmp:   active ? 28 + Math.random() * 36 : 12 + Math.random() * 18,
            });
        };

        const triggerAshDrop = (ax: number, ay: number) => {
            const count = 8 + Math.floor(Math.random() * 8);
            for (let i = 0; i < count; i++) {
                ashDropsRef.current.push({
                    x:  ax + (Math.random() - 0.5) * (CIGA_W - 4),
                    y:  ay + 2,
                    vx: (Math.random() - 0.5) * 30,
                    vy: -(3 + Math.random() * 12),
                    w:  2 + Math.random() * 6,
                    h:  1 + Math.random() * 3,
                    rot:  Math.random() * Math.PI,
                    rotV: (Math.random() - 0.5) * 7,
                    opacity: 0.75 + Math.random() * 0.25,
                });
            }
            /* reduce displayed ash — accumulate dropped amount */
            const drop = 18 + Math.random() * 10;
            ashDroppedRef.current += drop;
            setAshDropped(ashDroppedRef.current);
            ashDropLockRef.current = true;
            setTimeout(() => { ashDropLockRef.current = false; }, 1800);
        };

        const loop = (ts: number) => {
            if (lastSmokeTsRef.current === 0) lastSmokeTsRef.current = ts;
            const dt = Math.min((ts - lastSmokeTsRef.current) / 1000, 0.05);
            lastSmokeTsRef.current = ts;

            const ctx = canvas.getContext('2d');
            if (!ctx) { smokeRafRef.current = requestAnimationFrame(loop); return; }
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            /* Room haze */
            if (hazeRef.current > 0.015) {
                ctx.fillStyle = `rgba(120,100,65,${hazeRef.current * 0.09})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            /* Cigarette world coords */
            const cigTopY = canvas.height / 2 - CIGA_TOTAL / 2;
            const ashH    = BODY_H * bpRef.current;
            const dispAsh = Math.max(0, ashH - ashDroppedRef.current);
            const emberX  = canvas.width / 2;
            const emberY  = cigTopY + dispAsh;

            /* Ember ambient glow */
            if (isActiveRef.current && !isDoneRef.current) {
                const gr = ctx.createRadialGradient(emberX, emberY + EMBER_H, 0, emberX, emberY + EMBER_H, 180);
                gr.addColorStop(0,   'rgba(255,130,15,0.11)');
                gr.addColorStop(0.5, 'rgba(255,70,0,0.055)');
                gr.addColorStop(1,   'rgba(255,30,0,0)');
                ctx.fillStyle = gr;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            /* Ash drop trigger */
            if (isActiveRef.current && !isDoneRef.current && !ashDropLockRef.current) {
                if (dispAsh >= ASH_DROP_TRIGGER && Math.random() < 0.28 * dt) {
                    triggerAshDrop(emberX, cigTopY + dispAsh);
                }
            }

            /* Spawn smoke particles */
            if (!isDoneRef.current) {
                const active    = isActiveRef.current;
                const spawnRate = active ? 7 : 0.5;
                spawnAccRef.current += spawnRate * dt;
                while (spawnAccRef.current >= 1) {
                    spawnParticle(emberX, emberY, active);
                    spawnAccRef.current -= 1;
                }
                if (active) hazeRef.current = Math.min(hazeRef.current + 0.00025 * dt, 0.52);
            }

            if (particlesRef.current.length > 110) {
                particlesRef.current = particlesRef.current.slice(-110);
            }
            particlesRef.current = particlesRef.current.filter(p => p.life > 0);

            /* Draw smoke particles */
            for (const p of particlesRef.current) {
                p.life -= dt / p.maxLife;
                if (p.life <= 0) continue;
                const t  = 1 - p.life;
                p.x  += (p.vx + Math.sin(t * 5.5 + p.turbPhase) * p.turbAmp * 0.45) * dt;
                p.y  += p.vy * dt;
                p.vy += 28 * dt;
                p.vx *= (1 - 0.55 * dt);
                const sz = p.size + (p.maxSize - p.size) * Math.sqrt(t);
                const op = Math.sin(Math.min(t, 0.75) * Math.PI)
                    * p.baseOpacity
                    * Math.max(0, 1 - Math.max(0, t - 0.72) * 3.5);
                if (op < 0.008 || sz < 1) continue;
                const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz);
                g.addColorStop(0,    `rgba(202,194,182,${op * 0.68})`);
                g.addColorStop(0.38, `rgba(178,170,158,${op * 0.42})`);
                g.addColorStop(0.72, `rgba(155,148,136,${op * 0.18})`);
                g.addColorStop(1,    'rgba(138,130,118,0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
                ctx.fill();
            }

            /* Draw ash drops */
            ashDropsRef.current = ashDropsRef.current.filter(a => a.opacity > 0 && a.y < canvas.height + 60);
            for (const a of ashDropsRef.current) {
                a.x += a.vx * dt;
                a.y += a.vy * dt;
                a.vy += 280 * dt; // gravity
                a.vx *= (1 - 0.8 * dt);
                a.rot += a.rotV * dt;
                a.opacity -= 0.65 * dt;
                if (a.opacity <= 0) continue;
                ctx.save();
                ctx.translate(a.x, a.y);
                ctx.rotate(a.rot);
                ctx.globalAlpha = Math.max(0, a.opacity);
                ctx.fillStyle = `rgb(185,180,170)`;
                ctx.fillRect(-a.w / 2, -a.h / 2, a.w, a.h);
                ctx.restore();
            }
            ctx.globalAlpha = 1;

            smokeRafRef.current = requestAnimationFrame(loop);
        };

        smokeRafRef.current = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(smokeRafRef.current);
            ro.disconnect();
        };
    }, []);

    /* ── Render values ─────────────────────────────────── */
    const displayAshH    = Math.max(0, BODY_H * burnProgress - ashDropped);
    const remainingBodyH = BODY_H - (BODY_H * burnProgress);
    const pct            = Math.floor(burnProgress * 100);

    return (
        <div
            ref={containerRef}
            className="relative flex flex-col items-center justify-center w-full h-full select-none overflow-hidden"
            style={{
                background: 'radial-gradient(ellipse at 50% 44%, #1c1308 0%, #060505 100%)',
                cursor: isDone ? 'default' : 'pointer',
            }}
            onTouchStart={(e) => { e.preventDefault(); startBurning(); }}
            onTouchEnd={stopBurning}
            onTouchCancel={stopBurning}
            onMouseDown={startBurning}
            onMouseUp={stopBurning}
            onMouseLeave={stopBurning}
        >
            {/* Full-area smoke canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }} />

            {/* HUD */}
            {!isDone && (
                <div className="absolute top-0 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none"
                    style={{ zIndex: 10, paddingTop: 20 }}>
                    <p className="text-sm transition-colors duration-500"
                        style={{ color: isActive ? 'rgba(220,175,95,0.85)' : 'rgba(155,135,85,0.6)' }}>
                        {isActive ? '🚬 흡연 중...' : '스페이스바를 꾹 누르세요 / 모바일: 화면을 꾹 터치'}
                    </p>
                    <div className="w-52 h-1.5 rounded-full overflow-hidden" style={{ background: '#1c1c1c' }}>
                        <div className="h-full rounded-full"
                            style={{
                                width: `${pct}%`,
                                background: 'linear-gradient(to right, #ff6a00, #ee0979)',
                                transition: 'width 0.12s linear',
                            }} />
                    </div>
                    <p className="text-xs" style={{ color: 'rgba(130,110,70,0.55)' }}>
                        {pct}% 소비됨
                    </p>
                </div>
            )}

            {/* Mute button */}
            {!isDone && (
                <button
                    onClick={toggleMute}
                    className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 rounded-full transition-all"
                    style={{
                        zIndex: 15,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(234,88,12,0.22)',
                        color: isMuted ? 'rgba(100,70,30,0.45)' : 'rgba(234,88,12,0.8)',
                        fontSize: 16, cursor: 'pointer',
                    }}
                    title={isMuted ? '효과음 켜기' : '효과음 끄기'}
                >
                    {isMuted ? '🔇' : '🔊'}
                </button>
            )}

            {/* Cigarette */}
            <div style={{
                position: 'relative', width: CIGA_W, height: CIGA_TOTAL,
                overflow: 'visible', zIndex: 4,
                opacity: isDone ? 0.32 : 1, transition: 'opacity 0.6s',
            }}>

                {/* Ash */}
                {displayAshH > 1.5 && (
                    <div style={{
                        position: 'absolute', top: 0,
                        left: '50%', transform: 'translateX(-50%)',
                        width: CIGA_W - 5, height: displayAshH,
                        background: 'linear-gradient(to bottom, #d0d0c8 0%, #bbbbb2 30%, #a8a8a0 62%, #969690 100%)',
                        borderRadius: '3px 3px 1px 1px',
                        transition: 'height 0.3s ease-out',
                    }} />
                )}

                {/* Ember */}
                <div style={{
                    position: 'absolute', top: displayAshH, left: 0,
                    width: CIGA_W, height: EMBER_H, borderRadius: '2px',
                    background: isActive
                        ? 'radial-gradient(ellipse 88% 68% at 50% 38%, #ffee44 0%, #ffaa00 26%, #ff5500 54%, #991100 80%, transparent)'
                        : 'radial-gradient(ellipse 72% 60% at 50% 52%, #ff8800 0%, #dd4400 46%, rgba(58,5,0,0.75) 100%)',
                    boxShadow: isActive
                        ? '0 0 10px 4px rgba(255,128,0,0.88), 0 0 24px 10px rgba(255,58,0,0.52), 0 0 48px 20px rgba(255,28,0,0.16)'
                        : '0 0 5px 2px rgba(210,80,0,0.58)',
                    animation: isActive ? 'flamePulse 0.2s ease-in-out infinite alternate' : undefined,
                    zIndex: 3,
                }} />

                {/* Tobacco body */}
                {remainingBodyH > 0 && (
                    <div style={{
                        position: 'absolute', top: BODY_H * burnProgress + EMBER_H,
                        left: 0, width: CIGA_W, height: Math.max(0, remainingBodyH),
                        background: 'linear-gradient(to right, #c8c6c0 0%, #eeecea 26%, #f7f5f0 50%, #eeecea 74%, #c8c6c0 100%)',
                        borderLeft: '1px solid #bcb8b0', borderRight: '1px solid #bcb8b0', overflow: 'hidden',
                    }}>
                        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 0.7, background: 'rgba(165,155,140,0.38)', transform: 'translateX(-50%)' }} />
                        {[0.1, 0.24, 0.39, 0.54, 0.68, 0.82, 0.94].map((f, i) => (
                            <div key={i} style={{ position: 'absolute', top: `${f * 100}%`, left: 3, right: 3, height: 0.5, background: 'rgba(148,132,108,0.2)' }} />
                        ))}
                    </div>
                )}

                {/* Gold band */}
                <div style={{
                    position: 'absolute', top: BAND_TOP, left: 0, width: CIGA_W, height: BAND_H,
                    background: 'linear-gradient(to right, #8a7010 0%, #c8a012 18%, #e8c82a 35%, #f8e050 50%, #e8c82a 65%, #c8a012 82%, #8a7010 100%)',
                }} />

                {/* Cork filter */}
                <div style={{
                    position: 'absolute', top: FILTER_TOP, left: 0, width: CIGA_W, height: FILTER_H,
                    background: 'linear-gradient(to right, #8A4A18 0%, #BE6E2C 18%, #D88848 35%, #E29058 50%, #D88848 65%, #BE6E2C 82%, #8A4A18 100%)',
                    borderRadius: '0 0 5px 5px', overflow: 'hidden',
                }}>
                    {Array.from({ length: 17 }, (_, i) => (
                        <div key={i} style={{
                            position: 'absolute', top: `${(i / 16) * 88 + 3}%`, left: 1, right: 1, height: 0.65,
                            background: `rgba(${i % 2 === 0 ? '52,16,2' : '215,155,78'}, 0.22)`,
                        }} />
                    ))}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 7, background: 'rgba(65,22,4,0.28)', borderRadius: '0 0 5px 5px' }} />
                </div>
            </div>

            {/* Done overlay */}
            {isDone && (
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-5"
                    style={{ background: 'rgba(0,0,0,0.75)', zIndex: 20 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="text-5xl animate-bounce">💨</div>
                    <p className="text-2xl font-bold tracking-tight" style={{ color: '#f0e5cc' }}>
                        담배를 다 피웠습니다
                    </p>
                    <p className="text-xs tracking-[0.3em] uppercase" style={{ color: 'rgba(165,145,105,0.7)' }}>
                        건강을 위해 금연을 권장합니다
                    </p>

                    <div className="flex gap-3 mt-2">
                        {/* 다시 피우기 */}
                        <button
                            onClick={reset}
                            className="px-6 py-2.5 rounded-2xl text-sm font-bold text-white transition-colors"
                            style={{ background: '#2a2a2a' }}
                            onMouseOver={e => (e.currentTarget.style.background = '#404040')}
                            onMouseOut={e =>  (e.currentTarget.style.background = '#2a2a2a')}
                        >
                            다시 피우기
                        </button>

                        {/* 공유하기 */}
                        <button
                            onClick={handleShare}
                            className="px-6 py-2.5 rounded-2xl text-sm font-bold text-white flex items-center gap-2 transition-all"
                            style={{
                                background: shareState !== 'idle' ? '#16a34a' : '#1c88ff',
                                transition: 'background 0.3s',
                            }}
                            onMouseOver={e => { if (shareState === 'idle') e.currentTarget.style.background = '#3399ff'; }}
                            onMouseOut={e =>  { if (shareState === 'idle') e.currentTarget.style.background = '#1c88ff'; }}
                        >
                            {shareState === 'idle'   && '🚬 너도 한대 피울래?'}
                            {shareState === 'done'   && '✓ 공유 완료!'}
                            {shareState === 'copied' && '✓ 링크 복사됨!'}
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes flamePulse {
                    from { opacity: 0.88; transform: scaleX(0.96) scaleY(0.97); }
                    to   { opacity: 1;    transform: scaleX(1.04) scaleY(1.03); }
                }
            `}</style>
        </div>
    );
}
