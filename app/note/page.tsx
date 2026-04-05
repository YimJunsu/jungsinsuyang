'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

/* ─── Note / Pitch constants ─────────────────────────
 *  2-octave range: C3 (MIDI 48) → B4 (MIDI 71) = 24 notes
 *  beta (0..180) controls pitch:
 *    Laptop : lid opening angle  (0°=closed → 180°=fully open)
 *    Phone  : holding angle      (0°=flat   →  90°=upright)
 * ─────────────────────────────────────────────────── */
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const START_MIDI = 48;  // C3
const NOTE_COUNT = 24;  // 2 octaves

const NOTE_COLORS: Record<string, string> = {
  'C': '#60a5fa', 'C#': '#818cf8', 'D': '#a78bfa', 'D#': '#c084fc',
  'E': '#e879f9', 'F': '#f472b6', 'F#': '#fb7185', 'G': '#fb923c',
  'G#': '#fbbf24', 'A': '#a3e635', 'A#': '#34d399', 'B': '#22d3ee',
};

function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Map beta 0..180 → note index 0..NOTE_COUNT-1 */
function betaToPitch(beta: number): number {
  const t = Math.max(0, Math.min(180, beta)) / 180;
  return Math.min(NOTE_COUNT - 1, Math.floor(t * NOTE_COUNT));
}

export default function NotePage() {
  const [noteIdx,          setNoteIdx]          = useState(12);
  const [angle,            setAngle]            = useState(90);   // 0-180 (beta)
  const [started,          setStarted]          = useState(false);
  const [muted,            setMuted]            = useState(false);
  const [needsPermission,  setNeedsPermission]  = useState(false);
  const [usingOrientation, setUsingOrientation] = useState(false);
  const [isMobile,         setIsMobile]         = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef      = useRef<OscillatorNode | null>(null);
  const gainRef     = useRef<GainNode | null>(null);
  const mutedRef    = useRef(false);
  const startedRef  = useRef(false);

  /* ── Detect mobile vs laptop ── */
  useEffect(() => {
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
                || navigator.maxTouchPoints > 1;
    setIsMobile(mobile);
  }, []);

  const midiNote = START_MIDI + noteIdx;
  const noteName = NOTE_NAMES[midiNote % 12];
  const octave   = Math.floor(midiNote / 12) - 1;
  const freq     = midiToFreq(midiNote);
  const color    = NOTE_COLORS[noteName] ?? '#c084fc';

  /* ── Init Web Audio & begin playing ── */
  const startAudio = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStarted(true);

    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = midiToFreq(START_MIDI + 12);
    osc.connect(gain);
    osc.start();

    audioCtxRef.current = ctx;
    oscRef.current = osc;
    gainRef.current = gain;

    gain.gain.setTargetAtTime(0.30, ctx.currentTime, 0.1);
  }, []);

  /* ── Toggle mute ── */
  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setTargetAtTime(
        mutedRef.current ? 0 : 0.30,
        audioCtxRef.current.currentTime,
        0.08,
      );
    }
  }, []);

  /* ── Update pitch from beta angle (0-180) ── */
  const updateAngle = useCallback((beta: number) => {
    const clamped = Math.max(0, Math.min(180, beta));
    setAngle(clamped);
    const idx = betaToPitch(clamped);
    setNoteIdx(idx);
    if (oscRef.current && audioCtxRef.current) {
      const f = midiToFreq(START_MIDI + idx);
      oscRef.current.frequency.setTargetAtTime(f, audioCtxRef.current.currentTime, 0.04);
    }
  }, []);

  /* ── Device orientation — use beta ── */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isIOS = typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function';
    if (isIOS) {
      setNeedsPermission(true);
      return;
    }

    let hasEvent = false;
    const handler = (e: DeviceOrientationEvent) => {
      const b = e.beta;
      if (b === null) return;
      if (!hasEvent) {
        hasEvent = true;
        setUsingOrientation(true);
      }
      updateAngle(b);
    };
    window.addEventListener('deviceorientation', handler, true);
    return () => window.removeEventListener('deviceorientation', handler, true);
  }, [updateAngle]);

  /* ── Mouse fallback (desktop without orientation sensor) ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (usingOrientation) return;
      updateAngle((e.clientX / window.innerWidth) * 180);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [updateAngle, usingOrientation]);

  /* ── iOS permission ── */
  const requestPermission = useCallback(async () => {
    try {
      const req = (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission;
      const perm = await req();
      if (perm === 'granted') {
        setNeedsPermission(false);
        setUsingOrientation(true);
        const handler = (e: DeviceOrientationEvent) => {
          if (e.beta !== null) updateAngle(e.beta);
        };
        window.addEventListener('deviceorientation', handler, true);
      }
    } catch { /* ignore */ }
    startAudio();
  }, [startAudio, updateAngle]);

  /* ── Cleanup ── */
  useEffect(() => {
    return () => {
      oscRef.current?.stop();
      audioCtxRef.current?.close();
    };
  }, []);

  /* ── Gauge math (angle 0..180 → full semicircle) ── */
  const gaugeCX = 130, gaugeCY = 130, gaugeR = 100;
  const needleRad = (angle / 180) * Math.PI - Math.PI;
  const nx = gaugeCX + gaugeR * Math.cos(needleRad);
  const ny = gaugeCY + gaugeR * Math.sin(needleRad);

  /* ── Hint strings ── */
  const orientationStartHint = isMobile
    ? '폰을 세우거나 눕혀 음정을 조절해요'
    : '화면을 열고 닫아 음정을 조절해요';

  const orientationPlayHint = isMobile
    ? '📱 폰 각도로 음정 조절 (세우면 높아짐)'
    : '💻 화면 여닫는 각도로 음정 조절';

  return (
    <div className="flex flex-col overflow-hidden select-none" style={{ height: '100dvh', background: '#08050f' }}>
      <header
        className="flex items-center gap-3 px-4 shrink-0"
        style={{ height: 56, background: '#0d0918', borderBottom: '1px solid rgba(168,85,247,0.2)' }}
      >
        <Link href="/" className="flex items-center justify-center rounded-xl"
          style={{ width: 36, height: 36, color: '#c084fc' }}>
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <span className="text-base font-semibold" style={{ color: '#c084fc' }}>🎵 악기 연주</span>

        {started && !needsPermission && (
          <button
            onClick={toggleMute}
            style={{
              marginLeft: 'auto',
              width: 36, height: 36,
              borderRadius: 10,
              border: '1px solid rgba(168,85,247,0.3)',
              background: 'transparent',
              color: muted ? 'rgba(168,85,247,0.35)' : '#c084fc',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        )}
      </header>

      <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6">
        {needsPermission ? (
          /* iOS permission screen */
          <div className="flex flex-col items-center gap-6 text-center">
            <div style={{ fontSize: 64 }}>📱</div>
            <p style={{ color: '#c084fc', fontSize: 18, fontWeight: 600 }}>기기 기울기 권한이 필요해요</p>
            <p style={{ color: 'rgba(168,85,247,0.55)', fontSize: 14 }}>
              폰을 세우거나 눕혀서 음정을 바꿀 수 있어요
            </p>
            <button
              onClick={requestPermission}
              style={{
                padding: '14px 32px', borderRadius: 16,
                background: 'rgba(168,85,247,0.18)',
                border: '1.5px solid rgba(168,85,247,0.5)',
                color: '#c084fc', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              }}
            >
              권한 허용 후 연주 시작
            </button>
          </div>
        ) : !started ? (
          /* Start screen */
          <div className="flex flex-col items-center gap-8 text-center">
            <div style={{ fontSize: 72 }}>🎵</div>
            <div>
              <p style={{ color: '#c084fc', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                악기 연주
              </p>
              <p style={{ color: 'rgba(168,85,247,0.55)', fontSize: 14 }}>
                {usingOrientation
                  ? orientationStartHint
                  : '마우스를 좌우로 움직여 음정을 조절해요'}
              </p>
            </div>
            <button
              onClick={startAudio}
              style={{
                padding: '16px 48px', borderRadius: 20,
                background: 'rgba(168,85,247,0.18)',
                border: '1.5px solid rgba(168,85,247,0.5)',
                color: '#c084fc', cursor: 'pointer',
                fontSize: 16, fontWeight: 700,
                boxShadow: '0 0 24px rgba(168,85,247,0.2)',
              }}
            >
              ▶ 연주 시작
            </button>
          </div>
        ) : (
          /* Playing screen */
          <>
            {/* Semicircular gauge */}
            <div style={{ position: 'relative' }}>
              <svg viewBox="0 0 260 145" width={260} height={145}>
                {/* Background arc */}
                <path d={`M 30 130 A ${gaugeR} ${gaugeR} 0 0 1 230 130`}
                  fill="none" stroke="rgba(100,70,160,0.18)" strokeWidth={20} strokeLinecap="round" />
                {/* Color arc fill */}
                <path d={`M 30 130 A ${gaugeR} ${gaugeR} 0 0 1 230 130`}
                  fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" opacity={0.25} />

                {/* Tick marks */}
                {Array.from({ length: 25 }, (_, i) => {
                  const a  = -Math.PI + (i / 24) * Math.PI;
                  const r1 = gaugeR + 8;
                  const r2 = gaugeR + (i % 12 === 0 ? 20 : 14);
                  const bx = gaugeCX + r1 * Math.cos(a);
                  const by = gaugeCY + r1 * Math.sin(a);
                  const ex = gaugeCX + r2 * Math.cos(a);
                  const ey = gaugeCY + r2 * Math.sin(a);
                  const isMain = i % 12 === 0;
                  return (
                    <line key={i} x1={bx} y1={by} x2={ex} y2={ey}
                      stroke={isMain ? color : 'rgba(130,90,180,0.3)'}
                      strokeWidth={isMain ? 2.5 : 1} strokeLinecap="round" />
                  );
                })}

                {/* Labels */}
                <text x={22}       y={145} fontSize={9} fill="rgba(192,132,252,0.5)" textAnchor="middle" fontFamily="monospace">C3</text>
                <text x={gaugeCX}  y={26}  fontSize={9} fill="rgba(192,132,252,0.5)" textAnchor="middle" fontFamily="monospace">A3</text>
                <text x={238}      y={145} fontSize={9} fill="rgba(192,132,252,0.5)" textAnchor="middle" fontFamily="monospace">B4</text>

                {/* Needle */}
                <line x1={gaugeCX} y1={gaugeCY} x2={nx} y2={ny}
                  stroke={color} strokeWidth={3} strokeLinecap="round" />
                <circle cx={gaugeCX} cy={gaugeCY} r={8} fill={color} opacity={0.9} />
                <circle cx={gaugeCX} cy={gaugeCY} r={3} fill="#08050f" />
              </svg>
            </div>

            {/* Note display */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="font-bold leading-none"
                style={{
                  fontSize: 'clamp(80px, 22vw, 108px)',
                  color,
                  transition: 'color 0.08s',
                  fontFamily: 'monospace',
                }}
              >
                {noteName}
              </div>
              <div style={{ color: 'rgba(200,160,255,0.55)', fontSize: 14 }}>
                {octave}옥타브 &nbsp;·&nbsp; {Math.round(freq)} Hz
              </div>
            </div>

            {/* Status hint */}
            <p style={{ color: 'rgba(130,90,180,0.5)', fontSize: 12, textAlign: 'center' }}>
              {usingOrientation
                ? orientationPlayHint
                : '🖱 마우스를 좌우로 움직여 음정 조절'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
