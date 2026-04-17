'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import * as THREE from 'three';

const VERDICTS = [
  { type: 'nod' as const, msg: '그래, 살아있기는 하네', color: '#4ade80' },
  { type: 'sigh' as const, msg: '닭보다 못함', color: '#f87171' },
  { type: 'nod' as const, msg: '오케이 뭔가 하고 있어', color: '#4ade80' },
  { type: 'sigh' as const, msg: '이게 전부야?', color: '#f87171' },
  { type: 'nod' as const, msg: '합격 (기준이 낮긴 함)', color: '#4ade80' },
  { type: 'sigh' as const, msg: '부끄럽지도 않냐', color: '#f87171' },
  { type: 'nod' as const, msg: '그래도 뭔가 했네', color: '#4ade80' },
  { type: 'sigh' as const, msg: '(말을 잇지 못함)', color: '#f87171' },
  { type: 'nod' as const, msg: '존재 자체는 인정', color: '#4ade80' },
  { type: 'sigh' as const, msg: '닭이 이래서 인간 안 믿음', color: '#f87171' },
  { type: 'nod' as const, msg: '오늘은 할 수 있겠네 (아마도)', color: '#4ade80' },
  { type: 'sigh' as const, msg: '...음', color: '#f87171' },
];

interface SceneData {
  headPivot: THREE.Group;
  bodyGroup: THREE.Group;
  glowLight: THREE.PointLight;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  animState: 'idle' | 'nod' | 'sigh';
  animT: number;
  clock: THREE.Clock;
}

function buildChicken(scene: THREE.Scene): { chickenGroup: THREE.Group; headPivot: THREE.Group; bodyGroup: THREE.Group } {
  const whiteMat  = new THREE.MeshLambertMaterial({ color: 0xf0ead0 });
  const lightMat  = new THREE.MeshLambertMaterial({ color: 0xddd4b0 });
  const orangeMat = new THREE.MeshLambertMaterial({ color: 0xff8c00 });
  const redMat    = new THREE.MeshLambertMaterial({ color: 0xcc1100 });
  const blackMat  = new THREE.MeshLambertMaterial({ color: 0x111111 });
  const whitePure = new THREE.MeshLambertMaterial({ color: 0xffffff });

  const chickenGroup = new THREE.Group();
  const bodyGroup    = new THREE.Group();

  // Body
  const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32), whiteMat);
  bodyMesh.scale.set(1, 0.88, 0.85);
  bodyMesh.castShadow = true;
  bodyGroup.add(bodyMesh);

  // Tail feathers
  [-0.1, 0, 0.1].forEach((x, i) => {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.4, 7), lightMat);
    f.position.set(x * 1.6, 0.08 + i * 0.05, -0.48);
    f.rotation.x = -Math.PI / 3 - i * 0.07;
    f.castShadow = true;
    bodyGroup.add(f);
  });

  // Wings
  [-1, 1].forEach(side => {
    const wing = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 20), lightMat);
    wing.scale.set(0.3, 0.72, 0.85);
    wing.position.set(side * 0.52, -0.02, 0);
    wing.castShadow = true;
    bodyGroup.add(wing);
  });

  // Legs
  [-0.16, 0.16].forEach(x => {
    const legG = new THREE.Group();

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.28, 8), orangeMat);
    thigh.position.set(0, -0.14, 0);
    thigh.castShadow = true;
    legG.add(thigh);

    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.26, 8), orangeMat);
    shin.position.set(0, -0.41, 0.05);
    shin.rotation.x = 0.2;
    shin.castShadow = true;
    legG.add(shin);

    // Toes
    [0, 0.9, 1.8, -0.6].forEach((angle, ti) => {
      const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.011, 0.22, 6), orangeMat);
      const a = (angle / 2) - 0.3;
      toe.position.set(Math.sin(a) * 0.06, -0.56, 0.06 + Math.cos(a) * 0.07);
      toe.rotation.x = Math.PI / 2 - 0.3;
      toe.rotation.y = a;
      toe.castShadow = true;
      legG.add(toe);
    });

    legG.position.set(x, -0.42, 0);
    bodyGroup.add(legG);
  });

  chickenGroup.add(bodyGroup);

  // Head pivot (at neck joint)
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.5, 0.24);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 32), whiteMat);
  headMesh.position.set(0, 0.28, 0.05);
  headMesh.castShadow = true;
  headPivot.add(headMesh);

  // Beak upper
  const beakU = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.2, 8), orangeMat);
  beakU.position.set(0, 0.265, 0.32);
  beakU.rotation.x = Math.PI / 2;
  headPivot.add(beakU);

  // Beak lower
  const beakL = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 8), orangeMat);
  beakL.position.set(0, 0.235, 0.29);
  beakL.rotation.x = Math.PI / 2;
  headPivot.add(beakL);

  // Wattle
  const wattle = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), redMat);
  wattle.scale.set(0.65, 1.35, 0.65);
  wattle.position.set(0, 0.17, 0.3);
  headPivot.add(wattle);

  // Eyes
  [-0.13, 0.13].forEach(x => {
    const eW = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), whitePure);
    eW.position.set(x, 0.315, 0.24);
    headPivot.add(eW);

    const eP = new THREE.Mesh(new THREE.SphereGeometry(0.047, 12, 12), blackMat);
    eP.position.set(x, 0.315, 0.27);
    headPivot.add(eP);

    const eH = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 8), whitePure);
    eH.position.set(x + 0.02 * Math.sign(x), 0.33, 0.285);
    headPivot.add(eH);
  });

  // Comb (3 lobes)
  [
    { x: 0,     y: 0.565, z: 0.07, s: 1.0 },
    { x:  0.04, y: 0.535, z: 0.02, s: 0.78 },
    { x: -0.04, y: 0.535, z: 0.02, s: 0.78 },
  ].forEach(({ x, y, z, s }) => {
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.065 * s, 10, 10), redMat);
    lobe.position.set(x, y, z);
    headPivot.add(lobe);
  });

  chickenGroup.add(headPivot);
  chickenGroup.position.set(0, 0.1, 0);
  scene.add(chickenGroup);

  return { chickenGroup, headPivot, bodyGroup };
}

export default function ChickenPage() {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const animRef       = useRef<number>(0);
  const sceneRef      = useRef<SceneData | null>(null);
  const isAnimRef     = useRef(false);

  const [verdict, setVerdict] = useState<typeof VERDICTS[0] | null>(null);
  const [nods,    setNods]    = useState(0);
  const [sighs,   setSighs]   = useState(0);

  const doVerdict = useCallback((type?: 'nod' | 'sigh') => {
    if (isAnimRef.current) return;
    isAnimRef.current = true;

    const t = type ?? (Math.random() > 0.5 ? 'nod' : 'sigh');
    const pool = VERDICTS.filter(v => v.type === t);
    const v = pool[Math.floor(Math.random() * pool.length)];

    setVerdict(v);
    if (t === 'nod') setNods(p => p + 1);
    else setSighs(p => p + 1);

    if (sceneRef.current) {
      sceneRef.current.animState = t;
      sceneRef.current.animT = 0;
    }
    setTimeout(() => { isAnimRef.current = false; }, 2200);
  }, []);

  // Auto-judge every ~4s
  useEffect(() => {
    const id = setInterval(() => {
      if (!isAnimRef.current) doVerdict();
    }, 4000);
    return () => clearInterval(id);
  }, [doVerdict]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); doVerdict(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doVerdict]);

  // Three.js scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.parentElement?.clientWidth  ?? 800;
    const h = canvas.parentElement?.clientHeight ?? 500;

    const scene    = new THREE.Scene();
    scene.background = new THREE.Color(0x020202);

    const camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 100);
    camera.position.set(0, 0.6, 4.2);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const dir = new THREE.DirectionalLight(0xfff8e0, 1.25);
    dir.position.set(2, 4, 3);
    dir.castShadow = true;
    scene.add(dir);

    const fill = new THREE.DirectionalLight(0x8899ff, 0.28);
    fill.position.set(-2, 0, -1);
    scene.add(fill);

    const glowLight = new THREE.PointLight(0xfbbf24, 0.75, 8);
    glowLight.position.set(0, 1.2, 1.2);
    scene.add(glowLight);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshLambertMaterial({ color: 0x0a0a0a }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.18;
    ground.receiveShadow = true;
    scene.add(ground);

    const { headPivot, bodyGroup } = buildChicken(scene);

    const clock = new THREE.Clock();
    sceneRef.current = { headPivot, bodyGroup, glowLight, renderer, scene, camera, animState: 'idle', animT: 0, clock };

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      const d = sceneRef.current;
      if (!d) return;

      const elapsed = d.clock.getElapsedTime();

      // Idle body bob
      const bob = Math.sin(elapsed * 1.8) * 0.008;
      d.bodyGroup.position.y = bob;

      if (d.animState === 'idle') {
        // gentle continuous nodding in idle
        const idleNod = Math.max(0, Math.sin(elapsed * 2.2)) * 0.12;
        d.headPivot.rotation.x = THREE.MathUtils.lerp(d.headPivot.rotation.x, idleNod, 0.08);
        d.headPivot.rotation.z = Math.sin(elapsed * 0.95) * 0.028;
      } else if (d.animState === 'nod') {
        d.animT += 0.055;
        const t = d.animT;
        // Double nod: two quick forward dips
        d.headPivot.rotation.x = Math.sin(Math.min(t, 1.0) * Math.PI * 2) * 0.42 * Math.max(0, 1 - t * 0.55);
        if (t >= 1.6) { d.animState = 'idle'; d.animT = 0; }
      } else if (d.animState === 'sigh') {
        d.animT += 0.018;
        const t = d.animT;
        // Slow droop forward, hold, return
        if (t < 0.5) {
          d.headPivot.rotation.x = (t / 0.5) * 0.28;
        } else if (t < 1.2) {
          d.headPivot.rotation.x = 0.28;
          d.headPivot.rotation.z = Math.sin(elapsed * 5) * 0.04;
        } else {
          d.headPivot.rotation.x = THREE.MathUtils.lerp(0.28, 0, (t - 1.2) / 0.8);
          if (t >= 2.0) { d.animState = 'idle'; d.animT = 0; d.headPivot.rotation.z = 0; }
        }
      }

      d.glowLight.intensity = 0.6 + Math.sin(elapsed * 2.2) * 0.18;
      d.renderer.render(d.scene, d.camera);
    };

    animate();

    const onResize = () => {
      const nw = canvas.parentElement?.clientWidth  ?? window.innerWidth;
      const nh = canvas.parentElement?.clientHeight ?? 500;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      renderer.dispose();
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else (obj.material as THREE.Material).dispose();
        }
      });
      sceneRef.current = null;
    };
  }, []);

  const totalJudgments = nods + sighs;
  const approval = totalJudgments > 0 ? Math.round((nods / totalJudgments) * 100) : null;

  return (
    <div className="flex flex-col bg-[#020202] text-zinc-100 font-['Inter',sans-serif] overflow-hidden" style={{ height: '100dvh' }}>
      {/* Header */}
      <header className="relative z-20 w-full flex items-center justify-between px-6 h-16 border-b border-zinc-900 bg-black/85 backdrop-blur-md flex-shrink-0">
        <Link href="/" className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] tracking-[0.2em] uppercase font-black">뒤로</span>
        </Link>
        <div className="flex items-center gap-3">
          {totalJudgments > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800 text-[9px] tracking-widest uppercase font-bold">
              <span className="text-green-500">{nods} 끄덕</span>
              <span className="text-zinc-700">|</span>
              <span className="text-red-500">{sighs} 한숨</span>
            </div>
          )}
          {approval !== null && (
            <div className="text-[9px] tracking-widest uppercase font-bold px-2 py-1 rounded-lg"
              style={{ color: approval >= 50 ? '#4ade80' : '#f87171', background: 'rgba(255,255,255,0.04)' }}>
              승인율 {approval}%
            </div>
          )}
        </div>
      </header>

      {/* Three.js canvas */}
      <div className="relative flex-1 min-h-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ cursor: 'pointer' }}
          onClick={() => doVerdict()}
          title="클릭해서 판정받기"
        />
        {totalJudgments === 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-zinc-600 tracking-widest uppercase animate-pulse pointer-events-none">
            클릭 또는 스페이스로 판정받기
          </div>
        )}
      </div>

      {/* Verdict + stats */}
      <div className="flex-shrink-0 px-6 py-3 flex flex-col items-center gap-2 border-t border-zinc-900/80 bg-black/50">
        {verdict ? (
          <div className="text-center space-y-1.5">
            <div className="text-[9px] tracking-[0.5em] uppercase text-zinc-600">
              {verdict.type === 'nod' ? '✓ 고개 끄덕임' : '∿ 한숨 쉼'}
            </div>
            <p className="text-lg md:text-2xl font-black tracking-tight italic" style={{ color: verdict.color }}>
              "{verdict.msg}"
            </p>
          </div>
        ) : (
          <div className="text-[11px] text-zinc-700 tracking-widest uppercase">
            닭이 당신을 관찰 중...
          </div>
        )}

        {totalJudgments > 0 && (
          <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
            <div className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
              <div className="text-xl font-black" style={{ color: '#4ade80' }}>{nods}</div>
              <div className="text-[9px] text-zinc-600 uppercase tracking-widest">고개 끄덕임</div>
            </div>
            <div className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
              <div className="text-xl font-black" style={{ color: '#f87171' }}>{sighs}</div>
              <div className="text-[9px] text-zinc-600 uppercase tracking-widest">한숨</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
