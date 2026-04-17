'use client';

/**
 * 택배 오는 척 하기
 *
 * 카카오맵을 사용하려면:
 *   1. https://developers.kakao.com 에서 앱 생성 → '카카오맵' API 활성화
 *   2. 사이트 도메인 등록 (localhost:3000 포함)
 *   3. .env.local 에 NEXT_PUBLIC_KAKAO_MAP_KEY=발급받은_JavaScript_키 추가
 *
 * 키가 없으면 SVG 폴백 맵이 자동으로 표시됩니다.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Package, ChevronDown, AlertTriangle,
  RefreshCw, Phone, Truck, MapPin,
} from 'lucide-react';

declare global { interface Window { kakao: any } }

/* ════════════════════════════════════════════════
   택배사 브랜드 설정
════════════════════════════════════════════════ */
interface CourierBrand {
  primary:   string;   // 헤더/주요 색상
  dark:      string;   // 어두운 버전 (hover)
  light:     string;   // 연한 버전 (배경 tint)
  textLight: string;   // primary 위의 텍스트 색
  code:      string;   // 로고 짧은 코드
  tel:       string;   // 고객센터 번호
  failMsg:   string;   // 연락 실패 메시지
}

const COURIER_BRANDS: Record<string, CourierBrand> = {
  'CJ대한통운': {
    primary: '#004C97', dark: '#003875', light: '#EEF4FB',
    textLight: '#ffffff', code: 'CJ', tel: '1588-1255',
    failMsg: '연결 중... (연결 중...)',
  },
  '우체국택배': {
    primary: '#E3001B', dark: '#B80015', light: '#FFF4F5',
    textLight: '#ffffff', code: 'POST', tel: '1588-1300',
    failMsg: '우체국 대표 번호: 1588-1300 (연결 안 됨)',
  },
  '롯데택배': {
    primary: '#E60012', dark: '#C0000F', light: '#FFF4F5',
    textLight: '#ffffff', code: 'LOTTE', tel: '1588-2121',
    failMsg: '통화 연결음만 들립니다.',
  },
  '한진택배': {
    primary: '#001F5B', dark: '#001040', light: '#EEF0FA',
    textLight: '#ffffff', code: 'HJ', tel: '1588-0011',
    failMsg: '대기 인원 423명입니다.',
  },
  'GS Postbox': {
    primary: '#007A33', dark: '#005A24', light: '#EEF9F2',
    textLight: '#ffffff', code: 'GS', tel: '1577-1287',
    failMsg: '영업시간 외입니다 (09:00~18:00)',
  },
  '로젠택배': {
    primary: '#F47920', dark: '#D46010', light: '#FFF8F0',
    textLight: '#ffffff', code: 'LOGEN', tel: '1588-9988',
    failMsg: '기사님이 전화를 받지 않습니다.',
  },
  '쿠팡로켓': {
    primary: '#1A73E8', dark: '#1256B5', light: '#EEF5FF',
    textLight: '#ffffff', code: 'CP', tel: '1577-7011',
    failMsg: '로켓인데 왜 느리죠?',
  },
  '마켓컬리': {
    primary: '#5C2D91', dark: '#4A2274', light: '#F8F3FF',
    textLight: '#ffffff', code: 'MK', tel: '1644-1107',
    failMsg: '새벽 배송인데 낮에 전화하시면...',
  },
};

const DEFAULT_BRAND: CourierBrand = {
  primary: '#333', dark: '#111', light: '#f5f5f5',
  textLight: '#fff', code: '?', tel: '-',
  failMsg: '연결 실패',
};

function getBrand(courier: string): CourierBrand {
  return COURIER_BRANDS[courier] ?? DEFAULT_BRAND;
}

/* ════════════════════════════════════════════════
   상수
════════════════════════════════════════════════ */
const COURIERS = Object.keys(COURIER_BRANDS);

const STUCK_LAT  = 37.3595704;
const STUCK_LNG  = 127.1052128;
const STUCK_ADDR = '경기 성남시 분당구 서현동';

function dAgo(n: number, hhmm: string): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const yy = String(d.getFullYear()).slice(2);
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mo}.${dd} ${hhmm}`;
}

const EVENTS = [
  { time: dAgo(3, '06:47'), status: '배달지역도착', sub: '3일째 이 상태', loc: STUCK_ADDR,             state: 'current' as const },
  { time: dAgo(3, '05:12'), status: '배달출발',     sub: '담당기사 배정', loc: '성남 분당 배달터미널', state: 'done'    as const },
  { time: dAgo(4, '22:30'), status: '간선하차',     sub: '허브 처리 완료', loc: '경기남부 허브터미널', state: 'done'    as const },
  { time: dAgo(4, '14:15'), status: '간선상차',     sub: '간선 이동 중',   loc: '서울 허브터미널',     state: 'done'    as const },
  { time: dAgo(4, '09:23'), status: '집화처리',     sub: '집하 완료',      loc: '강남 집하장',          state: 'done'    as const },
] as const;

/* ════════════════════════════════════════════════
   폼 검증
════════════════════════════════════════════════ */
function validate(courier: string, num: string) {
  const e: { courier?: string; num?: string } = {};
  if (!courier) e.courier = '택배사를 선택해주세요.';
  if (!num)                               e.num = '송장번호를 입력해주세요.';
  else if (!/^\d+$/.test(num))            e.num = '숫자만 입력 가능합니다.';
  else if (num.length < 10)               e.num = '송장번호는 10자리 이상이어야 합니다.';
  else if (num.length > 14)              e.num = '송장번호는 14자리 이하여야 합니다.';
  return e;
}

/* ════════════════════════════════════════════════
   SVG 폴백 맵
════════════════════════════════════════════════ */
function FallbackMap({ markerColor }: { markerColor: string }) {
  const mc = markerColor;
  const mcRgba = `${parseInt(mc.slice(1,3),16)},${parseInt(mc.slice(3,5),16)},${parseInt(mc.slice(5,7),16)}`;

  return (
    <div style={{ width: '100%', height: 260, background: '#e8e2d8', position: 'relative', overflow: 'hidden' }}>
      <svg
        width="100%" height="100%"
        viewBox="0 0 700 260"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
      >
        <rect width="700" height="260" fill="#e8e2d8" />
        {/* 건물 블록 */}
        <rect x="0"   y="0"   width="120" height="80"  fill="#dbd5c8" rx="1" />
        <rect x="0"   y="88"  width="120" height="55"  fill="#dbd5c8" rx="1" />
        <rect x="0"   y="155" width="120" height="105" fill="#dbd5c8" rx="1" />
        <rect x="130" y="0"   width="75"  height="50"  fill="#dbd5c8" rx="1" />
        <rect x="130" y="60"  width="75"  height="85"  fill="#c8d8be" rx="1" />
        <rect x="130" y="155" width="75"  height="105" fill="#dbd5c8" rx="1" />
        <rect x="215" y="0"   width="100" height="260" fill="#e8e2d8" />  {/* 세로 도로 */}
        <rect x="325" y="0"   width="85"  height="120" fill="#dbd5c8" rx="1" />
        <rect x="325" y="148" width="85"  height="112" fill="#dbd5c8" rx="1" />
        <rect x="420" y="0"   width="110" height="260" fill="#e8e2d8" />  {/* 세로 도로 */}
        <rect x="540" y="0"   width="160" height="110" fill="#dbd5c8" rx="1" />
        <rect x="540" y="138" width="160" height="122" fill="#dbd5c8" rx="1" />
        {/* 가로 도로 */}
        <rect x="0"   y="80"  width="700" height="8"   fill="#f0ebe0" />
        <rect x="0"   y="120" width="700" height="28"  fill="#f0ebe0" />
        {/* 중앙선 */}
        <line x1="0" y1="134" x2="700" y2="134" stroke="#f5c518" strokeWidth="1" strokeDasharray="22,14" opacity="0.7" />
        <line x1="265" y1="0" x2="265" y2="260" stroke="#f5c518" strokeWidth="1" strokeDasharray="16,10" opacity="0.7" />
        <line x1="475" y1="0" x2="475" y2="260" stroke="#f5c518" strokeWidth="1" strokeDasharray="16,10" opacity="0.7" />
        {/* 도로 레이블 */}
        <text x="35"  y="44"  fill="#b0a898" fontSize="9"  fontFamily="sans-serif">성남로</text>
        <text x="137" y="104" fill="#7aaa6e" fontSize="8"  fontFamily="sans-serif">중앙공원</text>
        <text x="338" y="68"  fill="#b0a898" fontSize="9"  fontFamily="sans-serif">서현동</text>
        <text x="243" y="178" fill="#999"    fontSize="8"  fontFamily="sans-serif" transform="rotate(-90,243,178)">분당수내로</text>
        <text x="437" y="70"  fill="#999"    fontSize="8"  fontFamily="sans-serif" transform="rotate(-90,437,70)">황새울로</text>
      </svg>

      {/* 마커 */}
      <div style={{
        position: 'absolute', top: '50%', left: '44%',
        transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        zIndex: 10,
      }}>
        {/* 파동 */}
        <div style={{
          position: 'absolute',
          width: 56, height: 56, borderRadius: '50%',
          background: `rgba(${mcRgba},0.2)`,
          animation: 'del-pulse 2s ease-out infinite',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
        }} />
        {/* 핀 */}
        <div style={{
          width: 34, height: 34,
          borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          background: mc,
          border: '3px solid #ffffff',
          boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 2,
        }}>
          <span style={{ transform: 'rotate(45deg)', fontSize: 14 }}>📦</span>
        </div>
        {/* 말풍선 */}
        <div style={{
          marginTop: 8,
          background: '#1a1a1a',
          color: '#fff',
          fontSize: 11, fontWeight: 700,
          padding: '5px 11px', borderRadius: 5,
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          position: 'relative', zIndex: 2,
          fontFamily: 'Malgun Gothic, sans-serif',
        }}>
          3일째 여기 있어요...
          <div style={{
            position: 'absolute', top: -5, left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderBottom: '5px solid #1a1a1a',
          }} />
        </div>
      </div>

      {/* 하단 워터마크 */}
      <div style={{
        position: 'absolute', bottom: 6, right: 8,
        background: 'rgba(255,255,255,0.78)',
        fontSize: 9, padding: '2px 7px', borderRadius: 2,
        color: '#888', fontFamily: 'sans-serif',
      }}>
        © 지도 데이터
      </div>

      <style>{`
        @keyframes del-pulse {
          0%   { transform: translate(-50%,-50%) scale(0.5); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════
   카카오맵
════════════════════════════════════════════════ */
function KakaoMapView({ markerColor }: { markerColor: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  const initMap = useCallback(() => {
    if (!window.kakao || !containerRef.current) return;
    window.kakao.maps.load(() => {
      if (!containerRef.current) return;
      const center = new window.kakao.maps.LatLng(STUCK_LAT, STUCK_LNG);
      const map = new window.kakao.maps.Map(containerRef.current, { center, level: 5 });

      // 커스텀 마커 이미지 — 택배사 색상 적용
      const markerSvg = encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
          <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30S36 31.5 36 18C36 8.06 27.94 0 18 0z"
                fill="${markerColor}" stroke="#fff" stroke-width="2"/>
          <text x="18" y="23" text-anchor="middle" dominant-baseline="middle"
                font-size="16" font-family="sans-serif">📦</text>
        </svg>
      `);
      const markerImage = new window.kakao.maps.MarkerImage(
        `data:image/svg+xml,${markerSvg}`,
        new window.kakao.maps.Size(36, 48),
        { offset: new window.kakao.maps.Point(18, 48) }
      );

      const marker = new window.kakao.maps.Marker({ position: center, image: markerImage });
      marker.setMap(map);

      const info = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:7px 13px;font-size:12px;font-weight:700;white-space:nowrap;font-family:Malgun Gothic,sans-serif;color:#1a1a1a">📦 3일째 이 자리...</div>`,
      });
      info.open(map, marker);
    });
  }, [markerColor]);

  useEffect(() => {
    if (!kakaoKey) return;
    if (window.kakao?.maps) { initMap(); return; }

    const ID = 'kakao-maps-sdk';
    if (document.getElementById(ID)) {
      const wait = setInterval(() => {
        if (window.kakao) { clearInterval(wait); initMap(); }
      }, 200);
      return () => clearInterval(wait);
    }

    const s = document.createElement('script');
    s.id = ID;
    s.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false`;
    s.async = true;
    s.onload = initMap;
    s.onerror = () => setMapError(true);
    document.head.appendChild(s);
  }, [kakaoKey, initMap]);

  if (!kakaoKey || mapError) return <FallbackMap markerColor={markerColor} />;
  return <div ref={containerRef} style={{ width: '100%', height: 260, background: '#e8e2d8' }} />;
}

/* ════════════════════════════════════════════════
   입력 화면 (다크)
════════════════════════════════════════════════ */
function InputView({ onSearch }: { onSearch: (courier: string, num: string) => void }) {
  const [courier, setCourier] = useState('');
  const [num, setNum]         = useState('');
  const [errors, setErrors]   = useState<{ courier?: string; num?: string }>({});
  const [touched, setTouched] = useState({ courier: false, num: false });

  const brand = courier ? getBrand(courier) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(courier, num);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTouched({ courier: true, num: true });
      return;
    }
    onSearch(courier, num);
  };

  const inputBase: React.CSSProperties = {
    width: '100%', background: '#0e0e0e',
    borderRadius: 10, fontSize: 14,
    outline: 'none', transition: 'border-color 0.15s',
    fontFamily: 'Malgun Gothic, Apple SD Gothic Neo, sans-serif',
    color: '#fff',
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-16">
      {/* 헤더 */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Truck size={28} style={{ color: brand?.primary ?? '#888' }} className="transition-colors duration-300" />
        </div>
        <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600">Delivery Tracker</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
          배송 조회
        </h1>
        <p className="text-zinc-500 text-sm">어떤 번호를 입력해도 같은 결과가 나옵니다</p>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">

        {/* 택배사 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] tracking-widest uppercase text-zinc-500 font-bold">택배사</label>
          <div className="relative">
            {/* 선택된 택배사 색상 인디케이터 */}
            {brand && (
              <div style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)',
                width: 10, height: 10, borderRadius: '50%',
                background: brand.primary, zIndex: 1,
                boxShadow: `0 0 0 3px ${brand.primary}33`,
              }} />
            )}
            <select
              value={courier}
              onChange={e => {
                setCourier(e.target.value);
                if (touched.courier) setErrors(p => ({ ...p, courier: validate(e.target.value, num).courier }));
              }}
              onBlur={() => {
                setTouched(p => ({ ...p, courier: true }));
                setErrors(p => ({ ...p, courier: validate(courier, num).courier }));
              }}
              style={{
                ...inputBase,
                border: `1px solid ${touched.courier && errors.courier ? '#ef4444' : '#222'}`,
                padding: brand ? '13px 40px 13px 32px' : '13px 40px 13px 14px',
                appearance: 'none',
                cursor: 'pointer',
                color: courier ? '#fff' : '#555',
              }}
            >
              <option value="" disabled style={{ color: '#555', background: '#111' }}>선택하세요</option>
              {COURIERS.map(c => (
                <option key={c} value={c} style={{ color: '#fff', background: '#111' }}>{c}</option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
          </div>
          {touched.courier && errors.courier && (
            <p className="text-red-400 text-xs">{errors.courier}</p>
          )}
        </div>

        {/* 송장번호 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] tracking-widest uppercase text-zinc-500 font-bold">송장번호</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="숫자 10~14자리"
            value={num}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 14);
              setNum(v);
              if (touched.num) setErrors(p => ({ ...p, num: validate(courier, v).num }));
            }}
            onBlur={() => {
              setTouched(p => ({ ...p, num: true }));
              setErrors(p => ({ ...p, num: validate(courier, num).num }));
            }}
            style={{
              ...inputBase,
              border: `1px solid ${touched.num && errors.num ? '#ef4444' : '#222'}`,
              padding: '13px 14px',
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              fontSize: 15,
            }}
          />
          <div className="flex justify-between items-center">
            {touched.num && errors.num
              ? <p className="text-red-400 text-xs">{errors.num}</p>
              : <span />}
            <p className="text-zinc-700 text-xs ml-auto">{num.length} / 14</p>
          </div>
        </div>

        {/* 조회 버튼 */}
        <button
          type="submit"
          style={{
            background: brand?.primary ?? '#333',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '15px',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.05em',
            transition: 'background 0.25s, opacity 0.15s',
            fontFamily: 'Malgun Gothic, sans-serif',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          조회하기
        </button>
      </form>

      <div className="flex items-center gap-2 text-zinc-700 text-xs">
        <AlertTriangle size={12} className="text-amber-700/60" />
        아무도 믿지 마요.
      </div>
    </main>
  );
}

/* ════════════════════════════════════════════════
   결과 화면 — 택배사별 브랜드 컬러 적용
════════════════════════════════════════════════ */
function ResultView({ courier, trackNum, onBack }: { courier: string; trackNum: string; onBack: () => void }) {
  const brand = getBrand(courier);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const SF = 'Malgun Gothic, Apple SD Gothic Neo, sans-serif';

  /* 타임라인 연결선 height 계산용 */
  const timelineRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ background: '#f2f2f2', minHeight: '100dvh', fontFamily: SF }}>

      {/* ── 헤더 ── */}
      <header style={{
        background: brand.primary,
        backgroundImage: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.dark} 100%)`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      }}>
        {/* 상단 네비 */}
        <div style={{
          maxWidth: 640, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 52, padding: '0 16px',
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.75)',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
              padding: 0, fontFamily: SF,
            }}
          >
            <ArrowLeft size={16} />
            다시 조회
          </button>

          {/* 택배사 로고 뱃지 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 5,
              padding: '3px 9px',
              fontSize: 11, fontWeight: 900,
              color: '#fff', letterSpacing: '0.08em',
            }}>
              {brand.code}
            </div>
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: 15 }}>
              {courier}
            </span>
          </div>

          <button
            onClick={() => showToast('업데이트가 없습니다. (3일째 동일)')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 0 }}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* 현재 상태 배너 */}
        <div style={{
          maxWidth: 640, margin: '0 auto',
          padding: '10px 16px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            animation: 'res-glow 2s ease-in-out infinite',
          }}>
            <MapPin size={20} color="#fff" />
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, marginBottom: 2 }}>
              현재 상태
            </p>
            <p style={{ color: '#ffffff', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>
              배달지역도착
              <span style={{
                marginLeft: 8, fontSize: 10,
                background: 'rgba(255,255,255,0.25)',
                padding: '2px 7px', borderRadius: 10,
                verticalAlign: 'middle', fontWeight: 600,
              }}>
                3일째
              </span>
            </p>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>
              {STUCK_ADDR}
            </p>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '10px 14px 80px' }}>

        {/* ── 토스트 ── */}
        {toast && (
          <div style={{
            background: '#1a1a1a', color: '#fff',
            borderRadius: 8, padding: '11px 16px',
            fontSize: 13, marginBottom: 10,
            textAlign: 'center',
            animation: 'fadeSlide 0.2s ease',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}>
            {toast}
          </div>
        )}

        {/* ── 운송장 정보 카드 ── */}
        <div style={{
          background: '#fff', borderRadius: 12,
          padding: '16px 18px', marginBottom: 10,
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          borderTop: `3px solid ${brand.primary}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <p style={{ color: '#999', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>운송장번호</p>
              <p style={{ color: '#1a1a1a', fontWeight: 700, fontSize: 15, letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                {trackNum}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#999', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>예상 배달일</p>
              <p style={{ color: brand.primary, fontWeight: 700, fontSize: 13 }}>3분 후 도착예정</p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: '보내는 분', val: '구*핑' },
                { label: '받는 분',   val: '거*말님' },
                { label: '물품',      val: '무기 (1개)' },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p style={{ color: '#bbb', fontSize: 10, marginBottom: 3 }}>{label}</p>
                  <p style={{ color: '#333', fontSize: 13, fontWeight: 600 }}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 지도 ── */}
        <div style={{
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          marginBottom: 10,
        }}>
          <div style={{
            background: '#fff',
            padding: '12px 18px 0',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <MapPin size={14} color={brand.primary} />
            <p style={{ fontSize: 12, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              현재 위치
            </p>
          </div>
          <KakaoMapView markerColor={brand.primary} />
        </div>

        {/* ── 배송 추적 타임라인 ── */}
        <div style={{
          background: '#fff', borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          overflow: 'hidden', marginBottom: 10,
        }}>
          <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Truck size={14} color={brand.primary} />
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>배송 추적 내역</p>
          </div>

          <div ref={timelineRef} style={{ padding: '6px 18px 6px' }}>
            {EVENTS.map((ev, i) => {
              const isCurrent = ev.state === 'current';
              const isDone    = ev.state === 'done';
              const isLast    = i === EVENTS.length - 1;

              return (
                <div key={i} style={{ display: 'flex', gap: 14, paddingTop: 14, paddingBottom: isLast ? 14 : 0, position: 'relative' }}>
                  {/* 연결선 */}
                  {!isLast && (
                    <div style={{
                      position: 'absolute',
                      left: 10, top: 28, bottom: 0,
                      width: 2,
                      background: isDone
                        ? `linear-gradient(to bottom, ${brand.primary}, ${brand.primary}55)`
                        : '#e8e8e8',
                    }} />
                  )}

                  {/* 아이콘 */}
                  <div style={{ flexShrink: 0, zIndex: 1 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: isCurrent ? brand.primary : isDone ? brand.primary : '#e0e0e0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isCurrent ? `0 0 0 5px ${brand.primary}28` : 'none',
                      animation: isCurrent ? 'cur-pulse 2s ease-out infinite' : 'none',
                    }}>
                      {isDone && (
                        <svg width="12" height="12" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" fill="none"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {isCurrent && (
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />
                      )}
                    </div>
                  </div>

                  {/* 내용 */}
                  <div style={{ flex: 1, paddingBottom: isLast ? 0 : 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{
                          fontSize: 14,
                          fontWeight: isCurrent ? 800 : isDone ? 600 : 500,
                          color: isCurrent ? brand.primary : isDone ? '#1a1a1a' : '#c0c0c0',
                          display: 'flex', alignItems: 'center', gap: 6,
                          marginBottom: 2,
                        }}>
                          {ev.status}
                          {isCurrent && (
                            <span style={{
                              fontSize: 9, fontWeight: 800,
                              background: brand.primary, color: '#fff',
                              padding: '2px 6px', borderRadius: 10,
                              letterSpacing: '0.05em',
                            }}>
                              현재
                            </span>
                          )}
                        </p>
                        <p style={{
                          fontSize: 11,
                          color: isCurrent ? brand.primary : isDone ? '#999' : '#d0d0d0',
                          fontWeight: isCurrent ? 600 : 400,
                        }}>
                          {ev.sub}
                        </p>
                        <p style={{ fontSize: 11, color: isDone || isCurrent ? '#bbb' : '#d8d8d8', marginTop: 2 }}>
                          {ev.loc}
                        </p>
                      </div>
                      <p style={{
                        fontSize: 10, color: '#bbb',
                        whiteSpace: 'nowrap', marginLeft: 8,
                        fontFamily: 'monospace',
                      }}>
                        {ev.time}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 추가 안내 카드 ── */}
        <div style={{
          background: brand.light,
          border: `1px solid ${brand.primary}22`,
          borderRadius: 12, padding: '14px 18px',
          marginBottom: 10,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <Package size={18} color={brand.primary} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ color: '#333', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              배달 시도 안내
            </p>
            <p style={{ color: '#666', fontSize: 12, lineHeight: 1.6 }}>
              배달 시도 <strong style={{ color: brand.primary }}>3회</strong> 완료.<br />
              부재 중으로 인해 배달이 지연되고 있습니다.<br />
              <span style={{ color: '#aaa', fontSize: 11 }}>마지막 시도: {dAgo(3, '06:47')}</span>
            </p>
          </div>
        </div>

        {/* ── 하단 버튼 ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => showToast(brand.failMsg)}
            style={{
              flex: 1, padding: '14px', borderRadius: 10,
              background: '#fff', border: '1px solid #ddd',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              fontSize: 13, fontWeight: 600, color: '#333', cursor: 'pointer',
              fontFamily: SF,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f8f8f8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
          >
            <Phone size={15} color={brand.primary} />
            기사님께 연락
          </button>
          <button
            onClick={() => showToast('업데이트가 없습니다. (3일째 동일)')}
            style={{
              flex: 1, padding: '14px', borderRadius: 10,
              background: brand.primary, border: 'none',
              backgroundImage: `linear-gradient(135deg, ${brand.primary}, ${brand.dark})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer',
              fontFamily: SF,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <RefreshCw size={15} />
            새로고침
          </button>
        </div>

        {/* 고객센터 번호 */}
        <p style={{
          textAlign: 'center', marginTop: 14,
          color: '#c0c0c0', fontSize: 11,
          letterSpacing: '0.05em',
        }}>
          {courier} 고객센터 · {brand.tel}
        </p>
      </div>

      <style>{`
        @keyframes res-glow {
          0%, 100% { box-shadow: 0 0 0 0   rgba(255,255,255,0.2); }
          50%       { box-shadow: 0 0 0 10px rgba(255,255,255,0); }
        }
        @keyframes cur-pulse {
          0%   { box-shadow: 0 0 0 0   ${brand.primary}55; }
          70%  { box-shadow: 0 0 0 12px ${brand.primary}00; }
          100% { box-shadow: 0 0 0 0   ${brand.primary}00; }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════
   메인 페이지
════════════════════════════════════════════════ */
export default function DeliveryPage() {
  const [step,     setStep]     = useState<'input' | 'result'>('input');
  const [courier,  setCourier]  = useState('');
  const [trackNum, setTrackNum] = useState('');

  const handleSearch = useCallback((c: string, n: string) => {
    setCourier(c); setTrackNum(n); setStep('result');
  }, []);

  if (step === 'result') {
    return <ResultView courier={courier} trackNum={trackNum} onBack={() => setStep('input')} />;
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#020202', color: '#f4f4f5' }}>
      <header
        className="flex items-center justify-between px-6 shrink-0"
        style={{ height: 52, borderBottom: '1px solid #111' }}
      >
        <Link href="/" className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] tracking-[0.2em] uppercase font-black">뒤로</span>
        </Link>
        <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-700">DELIVERY TRACKER</span>
        <div style={{ width: 60 }} />
      </header>

      <InputView onSearch={handleSearch} />

      <footer
        className="shrink-0 flex items-center justify-center"
        style={{ height: 44, borderTop: '1px solid #111' }}
      >
        <p className="text-[10px] text-zinc-800 tracking-widest uppercase">
          택배사 무관 — 모든 번호 조회 가능
        </p>
      </footer>
    </div>
  );
}
