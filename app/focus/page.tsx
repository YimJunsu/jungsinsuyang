'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const GAME_DURATION = 30;

type DistractionType = 'ad' | 'notification' | 'popup' | 'sale' | 'download';

interface DistractionItem {
  id: number;
  type: DistractionType;
  title: string;
  sub?: string;
  cta?: string;
  x: number;
  y: number;
  borderColor: string;
  bg: string;
}

const POOL: Record<DistractionType, Array<{ title: string; sub?: string; cta?: string }>> = {
  ad: [
    { title: '🎰 오늘의 당첨자 선정!', sub: '00:00:01 후 만료', cta: '지금 수령' },
    { title: '💊 의사가 숨긴 비밀', sub: '클릭 시 공개됨', cta: '더보기' },
    { title: '🏠 집값 폭락 경고', sub: '지금 확인 안 하면 늦음', cta: '확인' },
    { title: '🤑 1억 당첨!! 축하드립니다', sub: '당신만 선택됨', cta: '수령하기' },
    { title: '😱 지금 놓치면 평생 후회', sub: '단 1명 남음', cta: 'GRAB IT' },
    { title: '🔴 LIVE 당첨자 발표 중', sub: '방금 옆집이 받아감', cta: '내꺼받기' },
  ],
  notification: [
    { title: '🔔 카카오톡 2847개 알림', sub: '지금 확인 안 하면 영구 삭제' },
    { title: '📧 긴급 이메일 도착', sub: '72시간 내 미확인 시 계정 정지' },
    { title: '📱 친구가 나를 태그함', sub: '지금 바로 확인' },
    { title: '💬 메시지 999+', sub: '긴급 — 즉시 확인 필요' },
    { title: '🚨 계정 비정상 접근 감지', sub: '지금 바로 잠금 해제하세요' },
    { title: '😤 누군가 내 사진 저장함', sub: '확인하지 않으면 공유됨' },
  ],
  popup: [
    { title: '🎁 오늘 딱 하루 무료!', sub: '1초 뒤 사라짐', cta: '받기' },
    { title: '⚠️ 바이러스 23개 감지!', sub: '즉각 조치 필요합니다', cta: '치료하기' },
    { title: '🏆 설문 완료 보상', sub: '지금 클릭해 수령하세요', cta: '수령' },
    { title: '🚨 당신의 IP가 차단됨', sub: '클릭해서 해제', cta: '해제하기' },
    { title: '🎯 IQ 테스트 결과 도착', sub: '당신만 아직 확인 안 함', cta: '보기' },
    { title: '💀 경고: 배터리 위험', sub: '지금 당장 조치하세요', cta: '조치하기' },
  ],
  sale: [
    { title: '⚡ 00:00:01 타임세일', sub: '97% 할인 마지막 기회!', cta: '구매' },
    { title: '🔥 재고 0개 남음!', sub: '지금 안 사면 영원히 못 삼', cta: '담기' },
    { title: '💸 오늘만 1+1+1+1+1', sub: '조건 없음 진짜임', cta: '지금' },
    { title: '💣 -99% 폭탄세일 3초', sub: '다른 사람이 보고 있음', cta: '빨리!' },
    { title: '🛒 장바구니 폭발직전', sub: '17명이 동시에 보는 중', cta: '결제하기' },
  ],
  download: [
    { title: '📥 무료 다운로드 완료', sub: 'free_prize_real.exe — 열기' },
    { title: '🎵 최신 음악 무료!', sub: 'bigbang_new_2024.mp3 — 열기' },
    { title: '🎮 게임 크랙 완료', sub: 'game_crack_v2.exe — 실행' },
    { title: '💰 돈버는앱_설치.apk', sub: '하루 10만원 보장 — 설치' },
  ],
};

const BORDER_COLORS: Record<DistractionType, string> = {
  ad: '#ff4444',
  notification: '#4488ff',
  popup: '#ff8800',
  sale: '#ff22aa',
  download: '#22cc88',
};
const BG_COLORS: Record<DistractionType, string> = {
  ad: '#1a0505',
  notification: '#050518',
  popup: '#1a0a00',
  sale: '#1a0010',
  download: '#001a0a',
};

let idSeq = 0;

function makeDistraction(): DistractionItem {
  const types: DistractionType[] = ['ad', 'notification', 'popup', 'sale', 'download'];
  const type = types[Math.floor(Math.random() * types.length)];
  const pool = POOL[type];
  const item = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: ++idSeq,
    type,
    title: item.title,
    sub: item.sub,
    cta: item.cta,
    x: 2 + Math.random() * 72,
    y: 2 + Math.random() * 80,
    borderColor: BORDER_COLORS[type],
    bg: BG_COLORS[type],
  };
}

function getVerdict(pct: number): string {
  if (pct >= 90) return '전설의 집중력. 닭도 질림';
  if (pct >= 75) return '꽤 괜찮은데? (놀라움)';
  if (pct >= 55) return '평범한 인간 수준';
  if (pct >= 35) return '광고에 너무 약함';
  if (pct >= 15) return '방해요소가 주인공이었음';
  return '닭보다 집중력이 낮음 (공식)';
}

export default function FocusPage() {
  const [phase, setPhase]             = useState<'ready' | 'playing' | 'result'>('ready');
  const [timeLeft, setTimeLeft]       = useState(GAME_DURATION);
  const [score, setScore]             = useState(0);
  const [misses, setMisses]           = useState(0);
  const [distractions, setDistractions] = useState<DistractionItem[]>([]);
  const [targetPos, setTargetPos]     = useState({ x: 50, y: 48 });
  const [targetPulse, setTargetPulse] = useState(false);

  const activeRef     = useRef(false);
  const timerRef      = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const spawnRef      = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const moveRef       = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const moveTarget = useCallback(() => {
    setTargetPos({ x: 12 + Math.random() * 70, y: 12 + Math.random() * 66 });
    setTargetPulse(true);
    setTimeout(() => setTargetPulse(false), 350);
  }, []);

  const spawnDistraction = useCallback(() => {
    if (!activeRef.current) return;
    const d = makeDistraction();
    const ttl = 1200 + Math.random() * 800;
    setDistractions(prev => [...prev, d]);
    setTimeout(() => setDistractions(prev => prev.filter(x => x.id !== d.id)), ttl);
  }, []);

  const stopTimers = useCallback(() => {
    clearInterval(timerRef.current);
    clearInterval(spawnRef.current);
    clearInterval(moveRef.current);
  }, []);

  const startGame = useCallback(() => {
    stopTimers();
    activeRef.current = true;
    setPhase('playing');
    setScore(0);
    setMisses(0);
    setDistractions([]);
    setTimeLeft(GAME_DURATION);
    moveTarget();

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          activeRef.current = false;
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    spawnRef.current = setInterval(spawnDistraction, 380);
    moveRef.current  = setInterval(moveTarget, 900);
  }, [moveTarget, spawnDistraction, stopTimers]);

  // Transition to result when timer hits 0
  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      stopTimers();
      setPhase('result');
    }
  }, [timeLeft, phase, stopTimers]);

  useEffect(() => () => stopTimers(), [stopTimers]);

  const hitTarget = useCallback(() => {
    if (phase !== 'playing') return;
    setScore(s => s + 1);
    moveTarget();
  }, [phase, moveTarget]);

  const hitDistraction = useCallback((id: number) => {
    if (phase !== 'playing') return;
    setMisses(m => m + 1);
    setDistractions(prev => prev.filter(d => d.id !== id));
  }, [phase]);

  const total = score + misses;
  const pct   = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="flex flex-col min-h-dvh text-zinc-100 font-['Inter',sans-serif] select-none overflow-hidden"
      style={{ animation: phase === 'playing' ? 'flashBg 3.5s ease-in-out infinite' : undefined, background: '#020202' }}>
      <style>{`
        @keyframes distrPop {
          from { transform: scale(0.7) translateY(-6px); opacity: 0; }
          to   { transform: scale(1)   translateY(0);    opacity: 1; }
        }
        @keyframes targetPulse {
          0%,100% { box-shadow: 0 0 18px rgba(244,63,94,0.55); }
          50%      { box-shadow: 0 0 42px rgba(244,63,94,0.95); }
        }
        @keyframes screenShake {
          0%,100% { transform: translate(0,0) rotate(0deg); }
          10%     { transform: translate(-3px,2px) rotate(-0.4deg); }
          20%     { transform: translate(3px,-2px) rotate(0.4deg); }
          30%     { transform: translate(-2px,3px) rotate(-0.3deg); }
          40%     { transform: translate(2px,-1px) rotate(0.2deg); }
          50%     { transform: translate(-1px,2px) rotate(-0.2deg); }
          60%     { transform: translate(3px,1px) rotate(0.3deg); }
          70%     { transform: translate(-2px,-2px) rotate(-0.1deg); }
          80%     { transform: translate(1px,3px) rotate(0.3deg); }
          90%     { transform: translate(-1px,-1px) rotate(-0.1deg); }
        }
        @keyframes flashBg {
          0%,85%,100% { background: #020202; }
          86%,94%     { background: #110002; }
          88%,96%     { background: #020202; }
        }
      `}</style>

      {/* Header */}
      <header className="relative z-50 w-full flex items-center justify-between px-6 h-16 border-b border-zinc-900 bg-black/85 backdrop-blur-md flex-shrink-0">
        <Link href="/" className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] tracking-[0.2em] uppercase font-black">뒤로</span>
        </Link>
        {phase === 'playing' && (
          <div className="flex items-center gap-5 text-[9px] tracking-widest uppercase font-bold">
            <span className="text-zinc-400">{timeLeft}초</span>
            <span className="text-green-500">✓ {score}</span>
            <span className="text-red-500">✕ {misses}</span>
          </div>
        )}
      </header>

      {/* Game area */}
      <main className="relative flex-1 overflow-hidden">

        {/* ── READY ── */}
        {phase === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-8 text-center">
            <div className="space-y-3">
              <div className="text-[10px] tracking-[0.5em] uppercase text-zinc-500">집중력 테스트</div>
              <h1 className="text-5xl md:text-6xl font-black italic text-white leading-tight">집중력 측정기</h1>
              <div className="text-zinc-400 text-sm leading-relaxed space-y-1">
                <p>🎯 빨간 점을 클릭하세요</p>
                <p>방해 요소는 무시하세요</p>
                <p className="text-zinc-600 text-xs">...절대 불가능</p>
              </div>
            </div>
            <button
              onClick={startGame}
              className="px-10 py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl"
              style={{ background: '#f43f5e', color: 'white', boxShadow: '0 0 32px rgba(244,63,94,0.4)' }}
            >
              시작
            </button>
          </div>
        )}

        {/* ── PLAYING ── */}
        {phase === 'playing' && (
          <div style={{ animation: 'screenShake 0.9s ease-in-out infinite', position: 'absolute', inset: 0 }}>
            {/* Timer bar */}
            <div className="absolute top-0 left-0 h-[3px] w-full bg-zinc-900 z-40">
              <div
                className="h-full transition-all duration-1000"
                style={{
                  width: `${(timeLeft / GAME_DURATION) * 100}%`,
                  background: timeLeft > 8 ? '#f43f5e' : '#ef4444',
                  boxShadow: '0 0 8px rgba(244,63,94,0.6)',
                }}
              />
            </div>

            {/* Target */}
            <button
              onClick={hitTarget}
              className="absolute flex items-center justify-center rounded-full font-black text-white text-2xl z-10 transition-[left,top] duration-300"
              style={{
                left: `${targetPos.x}%`,
                top: `${targetPos.y}%`,
                transform: 'translate(-50%,-50%)',
                width: 40,
                height: 40,
                background: '#f43f5e',
                border: '3px solid rgba(255,255,255,0.25)',
                animation: targetPulse ? 'none' : 'targetPulse 1.4s ease-in-out infinite',
                boxShadow: targetPulse
                  ? '0 0 48px rgba(244,63,94,1)'
                  : '0 0 18px rgba(244,63,94,0.55)',
              }}
              aria-label="집중 목표"
            >
              🎯
            </button>

            {/* Distractions */}
            {distractions.map(d => (
              <button
                key={d.id}
                onClick={() => hitDistraction(d.id)}
                className="absolute z-20 rounded-xl text-left shadow-2xl min-w-[175px] max-w-[240px]"
                style={{
                  left: `${d.x}%`,
                  top: `${d.y}%`,
                  background: d.bg,
                  border: `1.5px solid ${d.borderColor}`,
                  padding: '10px 12px',
                  animation: 'distrPop 0.18s ease-out',
                }}
              >
                <div className="text-[12px] font-bold text-white leading-tight pr-4">{d.title}</div>
                {d.sub && (
                  <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{d.sub}</div>
                )}
                {d.cta && (
                  <div
                    className="mt-2 text-center text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider"
                    style={{ background: d.borderColor, color: 'white' }}
                  >
                    {d.cta}
                  </div>
                )}
                <div
                  className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-zinc-500"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  ✕
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── RESULT ── */}
        {phase === 'result' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="space-y-2">
              <div className="text-[10px] tracking-[0.5em] uppercase text-zinc-500">결과</div>
              <div
                className="text-7xl md:text-8xl font-black tabular-nums"
                style={{ color: '#f43f5e', textShadow: '0 0 40px rgba(244,63,94,0.5)' }}
              >
                {pct}%
              </div>
              <div className="text-zinc-400 text-sm">집중력</div>
              <div className="text-[12px] text-zinc-500 italic mt-1">{getVerdict(pct)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
                <div className="text-3xl font-black text-green-500">{score}</div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">정타</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
                <div className="text-3xl font-black text-red-500">{misses}</div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">방해 클릭</div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="mt-2 px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 text-sm"
              style={{ background: '#f43f5e', color: 'white', boxShadow: '0 0 24px rgba(244,63,94,0.35)' }}
            >
              다시하기
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
