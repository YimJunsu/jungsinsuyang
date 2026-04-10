'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import * as THREE from 'three';

/* ─── Background pool (Unsplash — free commercial license) ─ */
const BACKGROUNDS = [
    // Nature / mountains
    'https://images.unsplash.com/photo-1542641728-6ca359b085f4?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2000&auto=format&fit=crop',
    // Space / night sky
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501854140801-50d01674aa3e?q=80&w=2000&auto=format&fit=crop',
    // Ocean / coastal
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=2000&auto=format&fit=crop',
    // City / urban night
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2000&auto=format&fit=crop',
    // Forest / autumn
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=2000&auto=format&fit=crop',
    // Sunrise / sky
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=2000&auto=format&fit=crop',
    // Desert / minimalist
    'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=2000&auto=format&fit=crop',
];

/* ─── Types ───────────────────────────────────────────── */
interface CrackGroup {
    id: number;
    paths: string[];
    x: number;
    y: number;
}

interface Shard {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    rotV: number;
    pts: string;   // SVG polygon points string (relative to shard origin)
    opacity: number;
    glint: boolean;
}

interface Flash {
    id: number;
    x: number;
    y: number;
}

/* ─── Desktop icon SVGs ───────────────────────────────── */
const IconPC = () => (
    <svg viewBox="0 0 44 44" width="44" height="44">
        <rect x="2" y="3" width="40" height="28" rx="3" fill="#1a7fdd" stroke="white" strokeWidth="1.8"/>
        <rect x="6" y="7" width="32" height="20" rx="1" fill="#87ceeb"/>
        <rect x="15" y="7" width="8" height="4" rx="1" fill="rgba(255,255,255,0.3)"/>
        <rect x="17" y="31" width="10" height="5" fill="rgba(255,255,255,0.9)"/>
        <rect x="12" y="36" width="20" height="4" rx="2" fill="rgba(255,255,255,0.9)"/>
    </svg>
);
const IconTrash = () => (
    <svg viewBox="0 0 44 44" width="44" height="44">
        <rect x="9" y="8" width="26" height="4" rx="2" fill="rgba(255,255,255,0.9)"/>
        <path d="M17 6 h10 v2 h-10 Z" fill="rgba(255,255,255,0.7)"/>
        <path d="M8 12 l2 26 h24 l2 -26 Z" fill="#5b9bd5" stroke="white" strokeWidth="1.5"/>
        <line x1="16" y1="18" x2="16" y2="34" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5"/>
        <line x1="22" y1="18" x2="22" y2="34" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5"/>
        <line x1="28" y1="18" x2="28" y2="34" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5"/>
    </svg>
);
const IconFolder = () => (
    <svg viewBox="0 0 44 44" width="44" height="44">
        <path d="M2 15 q0-5 5-5 h10 l4-4 h18 q5 0 5 5 v22 q0 5-5 5 H7 q-5 0-5-5 Z" fill="#ffca28"/>
        <path d="M2 19 h40 v18 q0 5-5 5 H7 q-5 0-5-5 Z" fill="#ffd54f"/>
        <rect x="9" y="26" width="14" height="2" rx="1" fill="rgba(160,100,0,0.3)"/>
        <rect x="9" y="31" width="20" height="2" rx="1" fill="rgba(160,100,0,0.3)"/>
    </svg>
);
const IconChrome = () => (
    <svg viewBox="0 0 44 44" width="44" height="44">
        <circle cx="22" cy="22" r="20" fill="white" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
        <path d="M22 22 L42 22 A20 20 0 0 0 32 5.3 Z" fill="#ea4335"/>
        <path d="M22 22 L32 5.3 A20 20 0 0 0 12 5.3 Z" fill="#fbbc05"/>
        <path d="M22 22 L12 5.3 A20 20 0 0 0 2 22 Z" fill="#34a853"/>
        <path d="M22 22 L2 22 A20 20 0 0 0 22 42 A20 20 0 0 0 42 22 Z" fill="#4285f4"/>
        <circle cx="22" cy="22" r="9" fill="white"/>
        <circle cx="22" cy="22" r="7" fill="#4285f4"/>
    </svg>
);
const IconFile = () => (
    <svg viewBox="0 0 44 44" width="44" height="44">
        <path d="M5 2 h22 l10 10 v30 q0 2-2 2 H7 q-2 0-2-2 Z" fill="white"/>
        <path d="M27 2 v8 h10 Z" fill="#c8d6e5"/>
        <rect x="5" y="2" width="22" height="6" rx="2" fill="#1976d2"/>
        <rect x="5" y="5" width="22" height="3" fill="#1976d2"/>
        <rect x="9" y="18" width="18" height="2" rx="1" fill="#7fb3d3"/>
        <rect x="9" y="24" width="22" height="2" rx="1" fill="#7fb3d3"/>
        <rect x="9" y="30" width="14" height="2" rx="1" fill="#7fb3d3"/>
        <circle cx="11" cy="5" r="1.4" fill="rgba(255,255,255,0.7)"/>
        <circle cx="16" cy="5" r="1.4" fill="rgba(255,255,255,0.7)"/>
        <circle cx="21" cy="5" r="1.4" fill="rgba(255,255,255,0.7)"/>
    </svg>
);
const IconApp = () => (
    <svg viewBox="0 0 44 44" width="44" height="44">
        <rect x="2" y="2" width="40" height="40" rx="10" fill="#1a1a2e"/>
        <text x="22" y="30" textAnchor="middle" fontSize="22" fill="white">정</text>
        <circle cx="34" cy="10" r="5" fill="#facc15"/>
        <text x="34" y="14" textAnchor="middle" fontSize="7" fill="#1a1a2e" fontWeight="bold">↗</text>
    </svg>
);
const IconPhoto = () => (
    <svg viewBox="0 0 44 44" width="44" height="44">
        <rect x="2" y="6" width="40" height="32" rx="4" fill="#4a90d9" stroke="white" strokeWidth="1.5"/>
        <circle cx="14" cy="16" r="4" fill="#ffcc00"/>
        <path d="M2 28 l12-10 10 8 8-6 10 8 v8 q0 4-4 4 H6 q-4 0-4-4 Z" fill="#2e7d32" opacity="0.85"/>
    </svg>
);

function DesktopIcon({ left, top, right, icon, label }: {
    left?: number; top?: number; right?: number;
    icon: React.ReactNode; label: string;
}) {
    return (
        <div
            className="absolute flex flex-col items-center gap-1 pointer-events-none select-none"
            style={{ left, top, right, width: 72 }}
        >
            <div style={{ filter: 'drop-shadow(1px 2px 4px rgba(0,0,0,0.8))' }}>
                {icon}
            </div>
            <span style={{
                color: 'white',
                fontSize: 11,
                fontWeight: 500,
                textAlign: 'center',
                lineHeight: 1.25,
                textShadow: '0 1px 3px black, 0 0 6px black, 1px 1px 0 black, -1px -1px 0 black',
                maxWidth: 72,
                wordBreak: 'break-all',
            }}>
                {label}
            </span>
        </div>
    );
}

function DesktopIcons({ damage }: { damage: number }) {
    const fade = Math.max(0, 1 - damage / 55);
    return (
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ opacity: fade }}>
            {/* Left column */}
            <DesktopIcon left={12} top={12}  icon={<IconPC/>}      label="내 PC" />
            <DesktopIcon left={12} top={107} icon={<IconFile/>}     label="이력서.txt" />
            <DesktopIcon left={12} top={202} icon={<IconFolder/>}   label="새 폴더" />
            <DesktopIcon left={12} top={297} icon={<IconTrash/>}    label="휴지통" />
            {/* Right column */}
            <DesktopIcon right={12} top={12}  icon={<IconChrome/>}  label="Chrome" />
            <DesktopIcon right={12} top={107} icon={<IconPhoto/>}   label="사진" />
            <DesktopIcon right={12} top={202} icon={<IconApp/>}     label="정신수양" />
        </div>
    );
}

/* ─── Crack path generator ────────────────────────────── */
function buildCrackPaths(cx: number, cy: number): string[] {
    const paths: string[] = [];
    const numRays = 8 + Math.floor(Math.random() * 6);
    const maxR = 70 + Math.random() * 90;
    const angles: number[] = [];

    for (let i = 0; i < numRays; i++) {
        const base = (i / numRays) * Math.PI * 2;
        angles.push(base + (Math.random() - 0.5) * ((Math.PI * 2) / numRays * 0.55));
    }

    for (const angle of angles) {
        const rayLen = maxR * (0.55 + Math.random() * 0.65);
        const ex = cx + Math.cos(angle) * rayLen;
        const ey = cy + Math.sin(angle) * rayLen;
        const cp1x = cx + Math.cos(angle) * rayLen * 0.38 + (Math.random() - 0.5) * 22;
        const cp1y = cy + Math.sin(angle) * rayLen * 0.38 + (Math.random() - 0.5) * 22;
        paths.push(`M ${cx.toFixed(1)} ${cy.toFixed(1)} Q ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);

        const numBranches = 1 + Math.floor(Math.random() * 3);
        for (let b = 0; b < numBranches; b++) {
            const t = 0.32 + Math.random() * 0.48;
            const bx0 = cx + (ex - cx) * t + (Math.random() - 0.5) * 8;
            const by0 = cy + (ey - cy) * t + (Math.random() - 0.5) * 8;
            const bAngle = angle + (Math.random() * 1.5 - 0.75);
            const bLen = rayLen * (0.22 + Math.random() * 0.38);
            const bex = bx0 + Math.cos(bAngle) * bLen;
            const bey = by0 + Math.sin(bAngle) * bLen;
            const bcp1x = bx0 + Math.cos(bAngle) * bLen * 0.45 + (Math.random() - 0.5) * 14;
            const bcp1y = by0 + Math.sin(bAngle) * bLen * 0.45 + (Math.random() - 0.5) * 14;
            paths.push(`M ${bx0.toFixed(1)} ${by0.toFixed(1)} Q ${bcp1x.toFixed(1)} ${bcp1y.toFixed(1)} ${bex.toFixed(1)} ${bey.toFixed(1)}`);

            if (Math.random() > 0.45) {
                const t2 = 0.38 + Math.random() * 0.42;
                const sbx = bx0 + (bex - bx0) * t2;
                const sby = by0 + (bey - by0) * t2;
                const sbA = bAngle + (Math.random() * 1.1 - 0.55);
                const sbL = bLen * (0.18 + Math.random() * 0.28);
                const sbex = sbx + Math.cos(sbA) * sbL;
                const sbey = sby + Math.sin(sbA) * sbL;
                paths.push(`M ${sbx.toFixed(1)} ${sby.toFixed(1)} L ${sbex.toFixed(1)} ${sbey.toFixed(1)}`);
            }
        }
    }
    return paths;
}

/* ─── Shard generator ─────────────────────────────────── */
function buildShards(x: number, y: number, idStart: number): Shard[] {
    const count = 14 + Math.floor(Math.random() * 10);
    return Array.from({ length: count }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 13;
        const size = 5 + Math.random() * 16;
        const verts = 3 + Math.floor(Math.random() * 4);
        const pts: string[] = [];
        for (let v = 0; v < verts; v++) {
            const a = (v / verts) * Math.PI * 2 + (Math.random() - 0.5) * 0.9;
            const r = size * (0.4 + Math.random() * 0.6);
            pts.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`);
        }
        return {
            id: idStart + i,
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2.5,
            rot: Math.random() * 360,
            rotV: (Math.random() - 0.5) * 18,
            pts: pts.join(' '),
            opacity: 0.75 + Math.random() * 0.25,
            glint: Math.random() > 0.65,
        };
    });
}

/* ─── Sound: Web Audio API smash ─────────────────────── */
function playSmashSound(muted: boolean) {
    if (muted) return;
    try {
        type Win = typeof window & { webkitAudioContext?: typeof AudioContext };
        const AudioCtx = window.AudioContext || (window as Win).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        // 1. Impact thud — low freq punch
        (() => {
            const len = Math.floor(ctx.sampleRate * 0.20);
            const buf = ctx.createBuffer(1, len, ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < len; i++) {
                const t = i / ctx.sampleRate;
                const env = Math.exp(-t * 22) * (1 - Math.exp(-t * 250));
                d[i] = (Math.sin(2 * Math.PI * 72 * t) * 0.8 + Math.sin(2 * Math.PI * 135 * t) * 0.35) * env;
            }
            const src = ctx.createBufferSource();
            src.buffer = buf;
            const g = ctx.createGain(); g.gain.value = 0.9;
            src.connect(g); g.connect(ctx.destination);
            src.start(now);
        })();

        // 2. Glass crack — high-freq noise burst
        (() => {
            const len = Math.floor(ctx.sampleRate * 0.22);
            const buf = ctx.createBuffer(1, len, ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < len; i++) {
                const t = i / ctx.sampleRate;
                const env = Math.exp(-t * 20) * Math.pow(1 - t / (len / ctx.sampleRate), 0.4);
                d[i] = (Math.random() * 2 - 1) * env;
            }
            const src = ctx.createBufferSource();
            src.buffer = buf;
            const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3800; bp.Q.value = 0.9;
            const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1400;
            const g = ctx.createGain(); g.gain.value = 0.7;
            src.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
            src.start(now + 0.018);
        })();

        // 3. Crystal tinkle — very high resonant shimmer
        (() => {
            const len = Math.floor(ctx.sampleRate * 0.18);
            const buf = ctx.createBuffer(1, len, ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < len; i++) {
                const t = i / ctx.sampleRate;
                d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 35);
            }
            const src = ctx.createBufferSource();
            src.buffer = buf;
            const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 7500; bp.Q.value = 3.5;
            const g = ctx.createGain(); g.gain.value = 0.45;
            src.connect(bp); bp.connect(g); g.connect(ctx.destination);
            src.start(now + 0.035);
        })();

        // 4. Debris rattles — 4 staggered micro-bursts
        for (let r = 0; r < 4; r++) {
            const len = Math.floor(ctx.sampleRate * 0.038);
            const buf = ctx.createBuffer(1, len, ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < len; i++) {
                d[i] = (Math.random() * 2 - 1) * Math.exp(-i / len * 10);
            }
            const src = ctx.createBufferSource();
            src.buffer = buf;
            const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
            bp.frequency.value = 1200 + r * 600; bp.Q.value = 1.6;
            const g = ctx.createGain(); g.gain.value = 0.28 - r * 0.04;
            src.connect(bp); bp.connect(g); g.connect(ctx.destination);
            src.start(now + 0.07 + r * 0.058);
        }

        setTimeout(() => ctx.close().catch(() => {}), 2200);
    } catch { /* unsupported */ }
}

/* ─── Main component ──────────────────────────────────── */
export default function SmashPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [bgIdx, setBgIdx]       = useState(0);
    const [cracks, setCracks]     = useState<CrackGroup[]>([]);
    const [shards, setShards]     = useState<Shard[]>([]);
    const [flashes, setFlashes]   = useState<Flash[]>([]);
    const [hitCount, setHitCount] = useState(0);
    const [shake, setShake]       = useState(false);
    const [isMuted, setIsMuted]   = useState(false);
    const [isFull, setIsFull]     = useState(false);
    const nextId = useRef(0);
    const mutedRef = useRef(false);
    const rafRef   = useRef<number>(0);
    const shardsRef = useRef<Shard[]>([]);

    /* ThreeJS Ref */
    const threeRef = useRef<{
        renderer: THREE.WebGLRenderer;
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        hammer: THREE.Group;
        pivot: THREE.Group;
    } | null>(null);

    const hitQueueRef = useRef<{ x: number, y: number }[]>([]);

    useEffect(() => {
        setBgIdx(Math.floor(Math.random() * BACKGROUNDS.length));
        const onFull = () => setIsFull(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFull);

        /* ThreeJS Setup */
        if (!containerRef.current) return;
        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
        camera.position.z = 800;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.pointerEvents = 'none';
        renderer.domElement.style.zIndex = '15';
        container.appendChild(renderer.domElement);

        const amb = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(amb);
        const dir = new THREE.DirectionalLight(0xffffff, 1.2);
        dir.position.set(5, 10, 7);
        scene.add(dir);

        // Hammer model
        const hammerGroup = new THREE.Group();
        const pivot = new THREE.Group();
        
        // Head
        const headGeo = new THREE.BoxGeometry(60, 40, 40);
        const headMat = new THREE.MeshStandardMaterial({ 
            color: 0xaaaaaa, 
            metalness: 0.9, 
            roughness: 0.1,
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 80; // offset from pivot
        hammerGroup.add(head);

        // Handle
        const handleGeo = new THREE.CylinderGeometry(6, 4, 160, 12);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.8 });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.position.y = 0;
        hammerGroup.add(handle);

        pivot.add(hammerGroup);
        pivot.position.z = -1000; // hide initially
        scene.add(pivot);

        threeRef.current = { renderer, scene, camera, hammer: hammerGroup, pivot };

        const onResize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

        return () => {
            document.removeEventListener('fullscreenchange', onFull);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
    }, []);

    /* shard physics loop */
    useEffect(() => {
        shardsRef.current = shards;
        const tick = () => {
            // physics parts
            const nextShards = shardsRef.current
                .map(s => ({
                    ...s,
                    x: s.x + s.vx,
                    y: s.y + s.vy,
                    vy: s.vy + 0.55,
                    vx: s.vx * 0.992,
                    rot: s.rot + s.rotV,
                    opacity: s.opacity - 0.012,
                }))
                .filter(s => s.opacity > 0 && s.y < (typeof window !== 'undefined' ? window.innerHeight + 80 : 1200));
            setShards(nextShards);

            // ThreeJS loop
            if (threeRef.current) {
                const { renderer, scene, camera, pivot } = threeRef.current;

                // Handle hit queue (delayed SVG effects)
                if (hitQueueRef.current.length > 0) {
                    const hit = hitQueueRef.current.shift()!;
                    triggerVisualEffects(hit.x, hit.y);
                }

                if (pivot.userData.animating) {
                    pivot.userData.time += 0.08;
                    const t = pivot.userData.time;
                    
                    if (t < 1) {
                        // Swing down
                        pivot.rotation.x = -Math.PI/2 + (Math.PI/2 + 0.5) * Math.sin(t * Math.PI/2);
                        pivot.position.z = 200 * (1-t);
                    } else {
                        // Swing back
                        const t2 = (t - 1) * 2;
                        pivot.position.z = -200 * t2;
                        if (t2 >= 1) {
                            pivot.userData.animating = false;
                            pivot.position.z = -1000;
                        }
                    }
                }

                renderer.render(scene, camera);
            }

            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    const triggerVisualEffects = useCallback((clientX: number, clientY: number) => {
        // crack
        const newCrack: CrackGroup = {
            id: nextId.current++,
            paths: buildCrackPaths(clientX, clientY),
            x: clientX,
            y: clientY,
        };

        // shards
        const newShards = buildShards(clientX, clientY, nextId.current);
        nextId.current += newShards.length;

        // flash
        const flashId = nextId.current++;
        setFlashes(prev => [...prev, { id: flashId, x: clientX, y: clientY }]);
        setTimeout(() => setFlashes(prev => prev.filter(f => f.id !== flashId)), 320);

        setCracks(prev => [...prev, newCrack].slice(-40));
        setShards(prev => [...prev, ...newShards]);
        setHitCount(prev => prev + 1);
        setShake(true);
        setTimeout(() => setShake(false), 90);
    }, []);

    const handleSmash = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();

        if (!document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen().catch(() => {});
        }

        const clientX = 'touches' in e
            ? (e as React.TouchEvent).touches[0]?.clientX ?? (e as React.TouchEvent).changedTouches[0]?.clientX
            : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e
            ? (e as React.TouchEvent).touches[0]?.clientY ?? (e as React.TouchEvent).changedTouches[0]?.clientY
            : (e as React.MouseEvent).clientY;

        if (clientX === undefined || clientY === undefined) return;

        // sound
        playSmashSound(mutedRef.current);

        // ThreeJS Hammer Animation
        if (threeRef.current) {
            const { pivot, camera } = threeRef.current;
            
            // Convert screen to world
            const x = (clientX / window.innerWidth) * 2 - 1;
            const y = -(clientY / window.innerHeight) * 2 + 1;
            
            const vector = new THREE.Vector3(x, y, 0.5);
            vector.unproject(camera);
            const dir = vector.sub(camera.position).normalize();
            const distance = -camera.position.z / dir.z;
            const pos = camera.position.clone().add(dir.multiplyScalar(distance));

            pivot.position.set(pos.x, pos.y + 60, 50);
            pivot.rotation.x = -Math.PI / 2 - 0.5;
            pivot.rotation.y = (Math.random() - 0.5) * 0.4;
            pivot.userData.animating = true;
            pivot.userData.time = 0;

            // Queue the crack/shard effect for a slight delay (when hammer hits)
            setTimeout(() => {
                hitQueueRef.current.push({ x: clientX, y: clientY });
            }, 80);
        } else {
            // Fallback if ThreeJS not ready
            triggerVisualEffects(clientX, clientY);
        }
    }, [triggerVisualEffects]);

    const toggleMute = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const next = !mutedRef.current;
        mutedRef.current = next;
        setIsMuted(next);
    }, []);

    const handleReset = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setCracks([]);
        setShards([]);
        setFlashes([]);
        setHitCount(0);
        setBgIdx(prev => (prev + 1) % BACKGROUNDS.length);
    }, []);

    /* damage overlay opacity */
    const damageOpacity = Math.min(hitCount / 60, 0.78);
    const shakeIntensity = Math.min(hitCount / 20, 1);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-dvh overflow-hidden select-none bg-black"
            style={{ touchAction: 'none' }}
            onMouseDown={handleSmash}
            onTouchStart={handleSmash}
        >
            {/* Background image */}
            <div
                className="absolute inset-0 transition-all duration-300"
                style={{
                    backgroundImage: `url('${BACKGROUNDS[bgIdx]}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: shake ? `translate(${(Math.random() - 0.5) * 10 * shakeIntensity}px, ${(Math.random() - 0.5) * 10 * shakeIntensity}px)` : 'none',
                    transition: shake ? 'none' : 'transform 0.1s ease-out',
                }}
            />

            {/* Damage vignette overlay */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.9) 100%)',
                    opacity: damageOpacity,
                }}
            />

            {/* Dark tint accumulation */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                style={{ background: 'rgba(0,0,0,0.5)', opacity: Math.min(hitCount / 80, 0.65) }}
            />

            {/* Desktop icons layer */}
            <DesktopIcons damage={hitCount} />

            {/* SVG layer: cracks + shards + flashes */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-20"
                style={{ overflow: 'visible' }}
            >
                <defs>
                    <filter id="glass-blur">
                        <feGaussianBlur stdDeviation="0.4" />
                    </filter>
                    <style>{`
                        @keyframes flashRipple {
                            0%   { transform: scale(0.1); opacity: 0.85; }
                            100% { transform: scale(4.5); opacity: 0; }
                        }
                        .flash-ring { animation: flashRipple 0.28s ease-out forwards; }
                    `}</style>
                </defs>

                {/* Impact flash rings */}
                {flashes.map(f => (
                    <g key={f.id} style={{ transformOrigin: `${f.x}px ${f.y}px` }}>
                        <circle
                            cx={f.x} cy={f.y} r="28"
                            fill="rgba(255, 250, 200, 0.35)"
                            stroke="rgba(255, 255, 255, 0.7)"
                            strokeWidth="2"
                            className="flash-ring"
                        />
                        <circle
                            cx={f.x} cy={f.y} r="12"
                            fill="rgba(255, 255, 255, 0.55)"
                            style={{
                                transformOrigin: `${f.x}px ${f.y}px`,
                                animation: 'flashRipple 0.18s ease-out forwards',
                            }}
                        />
                    </g>
                ))}

                {/* Cracks */}
                {cracks.map(cg => (
                    <g key={cg.id}>
                        {/* Shadow layer */}
                        {cg.paths.map((d, i) => (
                            <path
                                key={`s${i}`} d={d}
                                stroke="rgba(0,0,0,0.6)"
                                strokeWidth={i === 0 ? "3" : "1.8"}
                                fill="none"
                                strokeLinecap="round"
                                transform="translate(1,1)"
                            />
                        ))}
                        {/* Main crack lines */}
                        {cg.paths.map((d, i) => (
                            <path
                                key={`c${i}`} d={d}
                                stroke={i === 0 ? 'rgba(255,255,255,0.92)' : 'rgba(220,230,255,0.78)'}
                                strokeWidth={i === 0 ? "1.8" : "0.9"}
                                fill="none"
                                strokeLinecap="round"
                            />
                        ))}
                        {/* Impact point */}
                        <circle cx={cg.x} cy={cg.y} r="7" fill="rgba(0,0,0,0.85)" />
                        <circle cx={cg.x} cy={cg.y} r="9" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                        <circle cx={cg.x} cy={cg.y} r="3.5" fill="rgba(255,255,255,0.6)" />
                    </g>
                ))}

                {/* Glass shards */}
                {shards.map(s => (
                    <g
                        key={s.id}
                        transform={`translate(${s.x.toFixed(1)},${s.y.toFixed(1)}) rotate(${s.rot.toFixed(1)})`}
                        opacity={s.opacity}
                    >
                        <polygon
                            points={s.pts}
                            fill="rgba(190,220,255,0.55)"
                            stroke="rgba(255,255,255,0.9)"
                            strokeWidth="0.6"
                        />
                        {s.glint && (
                            <polygon
                                points={s.pts}
                                fill="rgba(255,255,255,0.35)"
                                stroke="none"
                                style={{ filter: 'url(#glass-blur)' }}
                            />
                        )}
                    </g>
                ))}
            </svg>

            {/* UI — top left controls */}
            <div
                className="absolute top-5 left-5 z-50 flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity duration-300"
                style={{ transition: 'opacity 0.3s' }}
            >
                <Link
                    href="/"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 hover:border-white/60 transition-all"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </Link>

                {/* Hit counter */}
                <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${hitCount > 0 ? 'bg-red-500' : 'bg-zinc-600'}`} />
                    <span className="text-white font-mono font-bold text-sm tracking-widest">
                        {String(hitCount).padStart(3, '0')}
                    </span>
                    <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">hits</span>
                </div>
            </div>

            {/* UI — top right controls */}
            <div
                className="absolute top-5 right-5 z-50 flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300"
            >
                {/* Mute button */}
                <button
                    onClick={toggleMute}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 hover:border-white/60 transition-all"
                    style={{ fontSize: 16 }}
                    title={isMuted ? '효과음 켜기' : '효과음 끄기'}
                >
                    {isMuted ? '🔇' : '🔊'}
                </button>

                {/* Reset / next background */}
                <button
                    onClick={handleReset}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 hover:border-white/60 transition-all"
                    title="화면 초기화 + 다음 배경"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                    </svg>
                </button>
            </div>

            {/* Initial prompt */}
            {hitCount === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                    <div className="text-center space-y-3">
                        <div className="text-6xl animate-bounce">🔨</div>
                        <p className="text-white font-black text-2xl tracking-tight drop-shadow-2xl">
                            클릭해서 부수세요
                        </p>
                        <p className="text-white/50 text-sm font-medium tracking-widest uppercase">
                            tap / click / smash
                        </p>
                    </div>
                </div>
            )}

            {/* Fullscreen ESC hint */}
            {isFull && hitCount > 0 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-50 opacity-20">
                    <span className="text-white text-[10px] uppercase tracking-[0.3em]">ESC — 전체화면 종료</span>
                </div>
            )}

            {/* Damage level badge */}
            {hitCount >= 10 && (
                <div className="absolute bottom-8 right-6 z-50 opacity-60 pointer-events-none">
                    <span
                        className="text-[10px] font-black tracking-[0.3em] uppercase"
                        style={{
                            color: hitCount >= 40 ? '#ff4444' : hitCount >= 20 ? '#ff8800' : '#ffcc00',
                        }}
                    >
                        {hitCount >= 50 ? '완전 파괴' : hitCount >= 30 ? '심각한 손상' : hitCount >= 15 ? '다수 균열' : '균열 발생'}
                    </span>
                </div>
            )}
        </div>
    );
}
