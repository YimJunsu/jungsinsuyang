'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/* ════════════════════════════════════════════════════
   Windows 11 스피너 — 5개 점이 원을 그리며 공전
   ════════════════════════════════════════════════════ */
function Win11Spinner() {
  const DOT_COUNT = 5;
  const RADIUS    = 20;   // px — center 거리
  const DOT_SIZE  = 6;    // px
  const SIZE      = (RADIUS + DOT_SIZE) * 2 + 4;

  const dots = Array.from({ length: DOT_COUNT }, (_, i) => {
    const angleDeg = (i / DOT_COUNT) * 360 - 90; // 12시 방향 시작
    const rad = (angleDeg * Math.PI) / 180;
    const cx  = SIZE / 2 + RADIUS * Math.cos(rad);
    const cy  = SIZE / 2 + RADIUS * Math.sin(rad);
    // 12시(i=0)가 가장 밝고 시계 방향으로 흐려짐
    const opacity = 0.15 + (0.85 * ((DOT_COUNT - i) / DOT_COUNT));
    const scale   = 0.6 + (0.4 * ((DOT_COUNT - i) / DOT_COUNT));
    return { cx, cy, opacity, scale, delay: (i / DOT_COUNT) * -1.2 };
  });

  return (
    <>
      <style>{`
        @keyframes win11-spin { to { transform: rotate(360deg); } }
      `}</style>
      <div
        style={{
          width: SIZE,
          height: SIZE,
          position: 'relative',
          animation: 'win11-spin 1.2s linear infinite',
        }}
      >
        {dots.map(({ cx, cy, opacity, scale }, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: DOT_SIZE,
              height: DOT_SIZE,
              borderRadius: '50%',
              background: '#ffffff',
              left: cx - DOT_SIZE / 2,
              top:  cy - DOT_SIZE / 2,
              opacity,
              transform: `scale(${scale})`,
            }}
          />
        ))}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════
   Windows 11 업데이트 구성 화면
   ref: "업데이트를 구성하는 중" 부팅 화면
   ════════════════════════════════════════════════════ */
function WindowsUpdateScreen({ onExit }: { onExit: () => void }) {
  const [pct, setPct] = useState(0);

  /* 실제 윈도우 업데이트처럼 특정 구간에서 멈춤 */
  useEffect(() => {
    const SEQUENCE = [
      { target: 12, speed: 700 },
      { target: 13, speed: 8000 },   // ← 여기서 오래 멈춤
      { target: 14, speed: 12000 },  // ← 거의 안 올라감
    ];
    let cur = 0;
    let step = 0;
    function tick() {
      if (step >= SEQUENCE.length) return;
      const { target, speed } = SEQUENCE[step];
      if (cur < target) {
        cur++;
        setPct(cur);
        setTimeout(tick, speed / (target - (SEQUENCE[step - 1]?.target ?? 0)));
      } else {
        step++;
        if (step < SEQUENCE.length) setTimeout(tick, SEQUENCE[step].speed);
      }
    }
    const t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      onClick={onExit}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: '#000000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'default', userSelect: 'none',
        fontFamily: '"Segoe UI", "Malgun Gothic", sans-serif',
      }}
    >
      {/* Windows 11 4-색 로고 */}
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: 36 }}>
        <rect x="0"  y="0"  width="29" height="29" fill="#F25022" />
        <rect x="35" y="0"  width="29" height="29" fill="#7FBA00" />
        <rect x="0"  y="35" width="29" height="29" fill="#00A4EF" />
        <rect x="35" y="35" width="29" height="29" fill="#FFB900" />
      </svg>

      {/* 스피너 */}
      <div style={{ marginBottom: 40 }}>
        <Win11Spinner />
      </div>

      {/* 메인 텍스트 */}
      <p style={{
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 400,
        marginBottom: 12,
        letterSpacing: 0,
      }}>
        업데이트를 구성하는 중
      </p>

      {/* 퍼센트 */}
      <p style={{ color: '#ffffff', fontSize: 18, fontWeight: 400 }}>
        {pct}% 완료
      </p>

      {/* 하단 고정 문구 — 실제 윈도우와 동일 */}
      <p style={{
        position: 'absolute',
        bottom: 36,
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 400,
        whiteSpace: 'nowrap',
      }}>
        PC를 끄지 마세요.
      </p>

      {/* 힌트 */}
      <p style={{
        position: 'absolute',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.2)',
        fontSize: 9,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>
        클릭하면 선택 화면으로 돌아갑니다
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   Windows 11 BSOD
   ref: Windows 11 실제 블루스크린 레이아웃
   ════════════════════════════════════════════════════ */

/* 고정 QR 패턴 (랜덤 제거 — render마다 변하지 않도록) */
const QR_CELLS: Array<[number, number]> = [
  // 좌상 포지션 마커
  [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],
  [0,1],[6,1],[0,2],[2,2],[3,2],[4,2],[6,2],
  [0,3],[2,3],[4,3],[6,3],[0,4],[2,4],[3,4],[4,4],[6,4],
  [0,5],[6,5],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],
  // 우상 포지션 마커
  [14,0],[15,0],[16,0],[17,0],[18,0],[19,0],[20,0],
  [14,1],[20,1],[14,2],[16,2],[17,2],[18,2],[20,2],
  [14,3],[16,3],[18,3],[20,3],[14,4],[16,4],[17,4],[18,4],[20,4],
  [14,5],[20,5],[14,6],[15,6],[16,6],[17,6],[18,6],[19,6],[20,6],
  // 좌하 포지션 마커
  [0,14],[1,14],[2,14],[3,14],[4,14],[5,14],[6,14],
  [0,15],[6,15],[0,16],[2,16],[3,16],[4,16],[6,16],
  [0,17],[2,17],[4,17],[6,17],[0,18],[2,18],[3,18],[4,18],[6,18],
  [0,19],[6,19],[0,20],[1,20],[2,20],[3,20],[4,20],[5,20],[6,20],
  // 데이터 영역 (임의 고정 패턴)
  [8,0],[10,0],[12,0],[9,1],[11,1],[8,2],[11,2],[13,2],
  [8,3],[10,3],[12,3],[9,4],[13,4],[8,5],[10,5],[11,5],
  [9,6],[12,6],[8,7],[10,7],[13,7],[9,8],[11,8],[12,8],
  [8,9],[13,9],[10,10],[11,10],[12,10],[8,11],[9,11],[13,11],
  [10,12],[12,12],[8,13],[11,13],[13,13],
  [8,14],[10,14],[12,14],[9,15],[11,15],[13,15],
  [8,16],[10,16],[12,16],[9,17],[11,17],[8,18],[10,18],[13,18],
  [9,19],[12,19],[8,20],[11,20],[13,20],
];

function QRCode() {
  const CELL = 3;      // px per cell
  const GRID = 21;
  const SIZE = CELL * GRID;
  const cellSet = new Set(QR_CELLS.map(([c, r]) => `${c},${r}`));

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <rect width={SIZE} height={SIZE} fill="#ffffff" />
      {Array.from({ length: GRID }, (_, row) =>
        Array.from({ length: GRID }, (_, col) =>
          cellSet.has(`${col},${row}`) ? (
            <rect
              key={`${col}-${row}`}
              x={col * CELL} y={row * CELL}
              width={CELL} height={CELL}
              fill="#000000"
            />
          ) : null
        )
      )}
    </svg>
  );
}

function BlueScreen({ onExit }: { onExit: () => void }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    /* BSOD는 빠르게 올라가다가 멈춤 */
    const TARGETS = [5, 10, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15];
    let idx = 0;
    const t = setInterval(() => {
      if (idx < TARGETS.length) {
        setPct(TARGETS[idx]);
        idx++;
      }
    }, 550);
    return () => clearInterval(t);
  }, []);

  const SF = 'Segoe UI, Malgun Gothic, sans-serif';   // System font

  return (
    <div
      onClick={onExit}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: '#0078D7',
        fontFamily: SF,
        cursor: 'default',
        userSelect: 'none',
        overflowY: 'auto',
      }}
    >
      {/* 콘텐츠 — 실제 윈도우 BSOD는 화면 중앙~좌 35-40% 지점에 위치 */}
      <div
        style={{
          paddingLeft: 'clamp(40px, 10vw, 160px)',
          paddingTop:  'clamp(80px, 14vh, 160px)',
          paddingRight: 40,
          maxWidth: 800,
        }}
      >
        {/* 슬픈 이모티콘 */}
        <p style={{
          color: '#ffffff',
          fontSize: 'clamp(80px, 13vw, 120px)',
          fontWeight: 300,
          lineHeight: 1,
          marginBottom: 'clamp(24px, 4vh, 40px)',
        }}>
          :(
        </p>

        {/* 메인 메시지 */}
        <p style={{
          color: '#ffffff',
          fontSize: 'clamp(16px, 2.4vw, 22px)',
          fontWeight: 400,
          lineHeight: 1.45,
          marginBottom: 'clamp(20px, 4vh, 36px)',
          maxWidth: 580,
        }}>
          PC에 문제가 발생했습니다. 몇 가지 오류 정보를 수집한 다음,
          자동으로 다시 시작합니다.
        </p>

        {/* 퍼센트 */}
        <p style={{
          color: '#ffffff',
          fontSize: 'clamp(16px, 2.4vw, 22px)',
          fontWeight: 400,
          marginBottom: 'clamp(32px, 6vh, 56px)',
        }}>
          {pct}% 완료
        </p>

        {/* QR + 설명 행 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 20 }}>
          {/* QR 코드 */}
          <div style={{ flexShrink: 0 }}>
            <QRCode />
          </div>

          {/* 오른쪽 텍스트 */}
          <div style={{ paddingTop: 4 }}>
            <p style={{
              color: '#ffffff',
              fontSize: 'clamp(12px, 1.5vw, 14px)',
              lineHeight: 1.6,
              marginBottom: 8,
            }}>
              자세한 내용을 보려면 이 QR 코드를 스캔하거나
              <br />
              나중에 오류 코드로 온라인에서 검색하세요.
            </p>
          </div>
        </div>

        {/* 중지 코드 */}
        <p style={{
          color: '#ffffff',
          fontSize: 'clamp(12px, 1.5vw, 14px)',
          marginBottom: 6,
          fontWeight: 400,
        }}>
          중지 코드: CRITICAL_PROCESS_DIED
        </p>

        {/* 실패 기능 */}
        <p style={{
          color: '#ffffff',
          fontSize: 'clamp(12px, 1.5vw, 14px)',
          fontWeight: 400,
        }}>
          실패한 기능: System
        </p>
      </div>

      {/* 힌트 */}
      <p style={{
        position: 'absolute',
        bottom: 10,
        right: 20,
        color: 'rgba(255,255,255,0.3)',
        fontSize: 9,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}>
        클릭하면 선택 화면으로 돌아갑니다
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   선택 화면 (검은 배경 + 2개 카드)
   ════════════════════════════════════════════════════ */
type Choice = 'update' | 'bsod' | null;

const OPTIONS = [
  {
    id: 'update' as const,
    label: '윈도우 업데이트',
    sub: '재시작 후 변화: 없음',
    icon: (
      <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
        <rect x="0"  y="0"  width="29" height="29" fill="#F25022" />
        <rect x="35" y="0"  width="29" height="29" fill="#7FBA00" />
        <rect x="0"  y="35" width="29" height="29" fill="#00A4EF" />
        <rect x="35" y="35" width="29" height="29" fill="#FFB900" />
      </svg>
    ),
  },
  {
    id: 'bsod' as const,
    label: '윈도우 블루스크린',
    sub: '중지 코드: CRITICAL_PROCESS_DIED',
    icon: (
      <span style={{ fontSize: 32, lineHeight: 1, display: 'block', color: '#ffffff' }}>:(</span>
    ),
  },
] as const;

export default function WindowsUpdatePage() {
  const [choice,  setChoice]  = useState<Choice>(null);
  const [hovered, setHovered] = useState<Choice>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const enterFs = useCallback(() => {
    const el = containerRef.current ?? document.documentElement;
    el.requestFullscreen?.().catch(() => {});
  }, []);

  const exitFs = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  const handleSelect = useCallback((id: Choice) => {
    setChoice(id);
    enterFs();
  }, [enterFs]);

  const handleExit = useCallback(() => {
    setChoice(null);
    exitFs();
  }, [exitFs]);

  /* Esc 등으로 fullscreen 빠져나오면 선택 초기화 */
  useEffect(() => {
    const cb = () => { if (!document.fullscreenElement) setChoice(null); };
    document.addEventListener('fullscreenchange', cb);
    return () => document.removeEventListener('fullscreenchange', cb);
  }, []);

  const SF = '"Segoe UI", "Malgun Gothic", sans-serif';

  return (
    <div ref={containerRef} style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#000000' }}>

      {/* ── 전체화면 오버레이 ── */}
      {choice === 'update' && <WindowsUpdateScreen onExit={handleExit} />}
      {choice === 'bsod'   && <BlueScreen          onExit={handleExit} />}

      {/* ── 헤더 ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52, padding: '0 24px',
        borderBottom: '1px solid #111',
        flexShrink: 0,
      }}>
        <Link
          href="/"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: '#71717a', textDecoration: 'none',
            fontSize: 10, letterSpacing: '0.2em',
            textTransform: 'uppercase', fontWeight: 900,
            fontFamily: SF,
          }}
        >
          <ArrowLeft size={16} />
          뒤로
        </Link>
        <span style={{
          fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.18)', fontFamily: SF,
        }}>
          WINDOWS UPDATE
        </span>
        <div style={{ width: 60 }} />
      </header>

      {/* ── 선택 메인 ── */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 48, padding: '64px 16px',
      }}>
        {/* 타이틀 */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.22)', fontFamily: SF, marginBottom: 12,
          }}>
            업데이트 하기
          </p>
          <h1 style={{
            color: '#ffffff', fontWeight: 600,
            fontSize: 'clamp(24px, 5vw, 40px)',
            fontFamily: SF, letterSpacing: '-0.01em',
            marginBottom: 8,
          }}>
            옵션을 선택하세요
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 13, fontFamily: SF }}>
            결과는 동일합니다
          </p>
        </div>

        {/* 카드 */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 16,
          width: '100%', maxWidth: 540, justifyContent: 'center',
        }}>
          {OPTIONS.map((opt) => {
            const isHov = hovered === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                onMouseEnter={() => setHovered(opt.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  flex: '1 1 220px',
                  background: isHov ? 'rgba(0,120,215,0.14)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isHov ? '#0078D7' : 'rgba(255,255,255,0.09)'}`,
                  borderRadius: 8,
                  padding: '28px 22px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.18s, border-color 0.18s, box-shadow 0.18s',
                  boxShadow: isHov ? '0 0 36px rgba(0,120,215,0.22)' : 'none',
                  fontFamily: SF,
                }}
              >
                <div style={{ marginBottom: 14 }}>{opt.icon}</div>
                <p style={{ color: '#ffffff', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
                  {opt.label}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                  {opt.sub}
                </p>
              </button>
            );
          })}
        </div>

        <p style={{
          color: 'rgba(255,255,255,0.14)', fontSize: 11,
          letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: SF,
        }}>
          선택 시 전체화면 전환 — 클릭하면 돌아옵니다
        </p>
      </main>

      {/* ── 푸터 ── */}
      <footer style={{
        flexShrink: 0, height: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderTop: '1px solid #111',
      }}>
        <p style={{
          color: 'rgba(255,255,255,0.1)', fontSize: 10,
          letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: SF,
        }}>
          © Microsoft Corporation. 책임 없음.
        </p>
      </footer>
    </div>
  );
}
