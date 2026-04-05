'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

/* ─── 디자인 시스템 설정 ─── */
const V_WIDTH = 380;   // 동물의 원본 높이 -> SVG 회전 후 실제 '화면 너비'가 됨
const HEAD_LEN = 550;  // 머리 타일의 세로 길이
const BODY_LEN = 460;  // 몸통 마디 하나의 세로 길이

const W   = 10000;     // 전체 원본 가로 길이 (동물이 가로로 누워있는 기준)
const GND = 328;       // 땅이 시작되는 높이
const BT  = 198;       // 동물의 등 높이 (Back Top)
const BB  = 292;       // 동물의 배 높이 (Belly Bottom)
const BMY = (BT + BB) / 2; // 몸통의 중앙선
const LH  = GND - BB;  // 다리 길이
const TW  = 230;       // 몸통 마디 내 다리 간격 너비

type Animal = 'dog' | 'cat' | 'cow' | 'monkey';
const ANIMALS: Animal[] = ['dog', 'cat', 'cow', 'monkey'];
const LABELS: Record<Animal, string> = {
    dog: '🐕 롱독', cat: '🐈 롱캣', cow: '🐄 롱카우', monkey: '🐒 롱몽키',
};
const PAGE_BG: Record<Animal, string> = {
    dog:    '#87CEEB',
    cat:    '#FFB56B',
    cow:    '#9ED8FF',
    monkey: '#228B22',
};

export default function AnimalPage() {
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [tileCount, setTileCount] = useState(10);
    const [score, setScore] = useState(0); // 현재 내려간 거리 기록

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mutedRef = useRef(false);
    const sentinel = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // 컴포넌트 마운트 시 랜덤 동물 선택
    useEffect(() => {
        setAnimal(ANIMALS[Math.floor(Math.random() * ANIMALS.length)]);
    }, []);

    // 오디오 설정
    useEffect(() => {
        const audio = new Audio('/audio/animal-theme.mp3');
        audio.loop = true;
        audio.volume = 0.42;
        audioRef.current = audio;

        const playAudio = () => {
            if (!mutedRef.current) audio.play().catch(() => {});
        };
        document.addEventListener('click', playAudio, { once: true });

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, []);

    // 스크롤 시 점수(거리) 계산
    useEffect(() => {
        const handleScroll = () => {
            if (!scrollContainerRef.current) return;
            const scrollTop = scrollContainerRef.current.scrollTop;
            // 타일 길이에 따른 대략적인 점수 계산 (머리 길이 제외한 몸통 누적분)
            const currentScore = Math.max(0, Math.floor((scrollTop - 100) / (BODY_LEN / 2)));
            setScore(currentScore);
        };

        const container = scrollContainerRef.current;
        container?.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
    }, []);

    // 무한 스크롤 구현
    useEffect(() => {
        const el = sentinel.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) setTileCount(c => c + 6);
            },
            { rootMargin: '600px' }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [animal]);

    const toggleMute = useCallback(() => {
        const next = !mutedRef.current;
        mutedRef.current = next;
        setIsMuted(next);
        if (audioRef.current) {
            if (next) audioRef.current.pause();
            else audioRef.current.play().catch(() => {});
        }
    }, []);

    // PDF/인쇄 기능
    const handlePrint = () => {
        window.print();
    };

    return (
        <div
            ref={scrollContainerRef}
            className="no-print" // 인쇄 시 배경 레이어 조절용
            style={{
                height: '100dvh',
                overflowY: 'auto',
                overflowX: 'hidden',
                background: animal ? PAGE_BG[animal] : '#87CEEB',
                scrollBehavior: 'smooth'
            }}
        >
            {/* 상단 고정 헤더 */}
            <header style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                height: 52, display: 'flex', alignItems: 'center', padding: '0 20px',
                background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', color: 'white'
            }}>
                <Link href="/" style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.5 15l-5-5 5-5" />
                    </svg>
                </Link>
                <span style={{ marginLeft: '12px', fontWeight: 600 }}>{animal ? LABELS[animal] : '🐾'}</span>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px' }}>
                    {/* PDF 프린트 버튼 */}
                    <button
                        onClick={handlePrint}
                        style={{ background: 'white', color: 'black', border: 'none', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        📄 PDF 저장
                    </button>
                    <button onClick={toggleMute} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
                        {isMuted ? '🔇' : '🔊'}
                    </button>
                </div>
            </header>

            {/* 왼쪽 중앙 스크롤 기록 (Longdog Challenge 스타일) */}
            <div style={{
                position: 'fixed', left: '20px', top: '50%', transform: 'translateY(-50%)',
                zIndex: 90, pointerEvents: 'none', textAlign: 'left'
            }}>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    WOW! YOU ARE
                </div>
                <div style={{ fontSize: '42px', color: 'white', fontWeight: 900, lineHeight: 1, textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
                    {score}<span style={{ fontSize: '20px', marginLeft: '4px' }}>m</span>
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: 'bold' }}>
                    LONG
                </div>
            </div>

            {/* 동물 트랙 본체 */}
            {animal && (
                <div id="printable-area" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    marginTop: '0px'
                }}>
                    <div style={{ width: '100%', maxWidth: '600px', background: 'white', boxShadow: '0 0 50px rgba(0,0,0,0.1)' }}>
                        <HeadTile animal={animal} />
                        {Array.from({ length: tileCount }, (_, i) => (
                            <BodyTile key={i} animal={animal} />
                        ))}
                    </div>
                    <div ref={sentinel} style={{ height: '200px', width: '100%' }} />
                </div>
            )}

            {/* 인쇄 시 필요한 스타일 정의 */}
            <style jsx global>{`
                @media print {
                    .no-print, header, button { display: none !important; }
                    body { background: white !important; }
                    #printable-area { margin-top: 0 !important; width: 100% !important; }
                }
            `}</style>
        </div>
    );
}

/* ─── SVG 타일 컴포넌트 ─── */

function HeadTile({ animal }: { animal: Animal }) {
    const transform = `rotate(-90) translate(-10000, 0)`;
    return (
        <svg viewBox={`0 0 ${V_WIDTH} ${HEAD_LEN}`} preserveAspectRatio="xMidYMin slice" style={{ display: 'block', width: '100%', height: 'auto' }}>
            <g transform={transform}>
                {animal === 'dog'    && <DogHeadSVG />}
                {animal === 'cat'    && <CatHeadSVG />}
                {animal === 'cow'    && <CowHeadSVG />}
                {animal === 'monkey' && <MonkeyHeadSVG />}
            </g>
        </svg>
    );
}

function BodyTile({ animal }: { animal: Animal }) {
    const transform = `rotate(-90) translate(-${BODY_LEN}, 0)`;
    return (
        <svg viewBox={`0 0 ${V_WIDTH} ${BODY_LEN}`} preserveAspectRatio="xMidYMin slice" style={{ display: 'block', width: '100%', height: 'auto' }}>
            <g transform={transform}>
                {animal === 'dog'    && <DogBodyContent />}
                {animal === 'cat'    && <CatBodyContent />}
                {animal === 'cow'    && <CowBodyContent />}
                {animal === 'monkey' && <MonkeyBodyContent />}
            </g>
        </svg>
    );
}

/* ─── 공통 배경 컴포넌트 ─── */
function SkyGround({ animal, width = W }: { animal: Animal, width?: number }) {
    const colors: Record<Animal, string[]> = {
        dog:    ['#87CEEB', '#C5E8FF', '#5a8040'],
        cat:    ['#FFB56B', '#FF7A3A', '#8B6340'],
        cow:    ['#9ED8FF', '#C8EDFF', '#7AAD50'],
        monkey: ['#228B22', '#145214', '#5a3010'],
    };
    const c = colors[animal];
    return (
        <>
            <rect x={0} y={0} width={width} height={GND} fill={c[0]} />
            <rect x={0} y={GND} width={width} height={V_WIDTH - GND} fill={c[2]} />
        </>
    );
}

/* ─── 각 동물별 SVG 데이터 ─── */

// --- 강아지 (DOG) ---
function DogHeadSVG() {
    const C = '#C9853C', CD = '#9A6020', CL = '#DDA860', HS = 9450;
    return (
        <>
            <SkyGround animal="dog" />
            <g transform={`translate(${HS},0)`}>
                <rect x={0} y={BT} width={150} height={BB-BT} fill={C} />
                <ellipse cx={210} cy={BMY} rx={85} ry={90} fill={C} />
                <ellipse cx={160} cy={BMY-40} rx={30} ry={40} fill={CD} />
                <circle cx={235} cy={BMY-25} r={14} fill="#1a0c00" />
                <circle cx={238} cy={BMY-30} r={4} fill="white" />
                <ellipse cx={235} cy={BMY+25} rx={45} ry={35} fill={CL} />
                <ellipse cx={235} cy={BMY+15} rx={18} ry={14} fill="#1a0a00" />
                <path d={`M220 ${BMY+30} Q235 ${BMY+45} 250 ${BMY+30}`} stroke="#1a0a00" strokeWidth="3" fill="none" />
                <ellipse cx={235} cy={BMY+48} rx={14} ry={12} fill="#FF7090" />
                <rect x={68} y={BB} width={19} height={LH} rx={9} fill={CD} />
                <ellipse cx={77} cy={GND-3} rx={16} ry={8} fill={C} />
            </g>
        </>
    );
}
function DogBodyContent() {
    const C = '#C9853C', CD = '#9A6020';
    return (
        <>
            <SkyGround animal="dog" width={BODY_LEN} />
            {[0, TW].map(x => (
                <g key={x} transform={`translate(${x}, 0)`}>
                    <rect x={0} y={BT} width={TW+1} height={BB-BT} fill={C} />
                    <rect x={44} y={BB} width={19} height={LH} rx={9} fill={CD} />
                    <ellipse cx={53} cy={GND-3} rx={16} ry={8} fill={C} />
                </g>
            ))}
        </>
    );
}

// --- 고양이 (CAT) ---
function CatHeadSVG() {
    const C = '#E07030', CS = '#A04010', CL = '#F0C080', CN = '#FF99BB', HS = 9450;
    return (
        <>
            <SkyGround animal="cat" />
            <g transform={`translate(${HS},0)`}>
                <rect x={0} y={BT} width={150} height={BB-BT} fill={C} />
                <polygon points="190,200 240,180 210,240" fill={CS} />
                <polygon points="190,320 240,340 210,280" fill={CS} />
                <circle cx={220} cy={BMY} r={80} fill={C} />
                <circle cx={250} cy={BMY-30} r={14} fill="white" />
                <rect x={250} y={BMY-38} width={4} height={16} rx={2} fill="#18380A" />
                <circle cx={250} cy={BMY+30} r={14} fill="white" />
                <rect x={250} y={BMY+22} width={4} height={16} rx={2} fill="#18380A" />
                <ellipse cx={275} cy={BMY-18} rx={25} ry={20} fill={CL} />
                <ellipse cx={275} cy={BMY+18} rx={25} ry={20} fill={CL} />
                <polygon points={`285,${BMY-8} 285,${BMY+8} 295,${BMY}`} fill={CN} />
                <line x1="270" y1={BMY-15} x2="310" y2={BMY-40} stroke="white" strokeWidth="1" />
                <line x1="270" y1={BMY+15} x2="310" y2={BMY+40} stroke="white" strokeWidth="1" />
                <rect x={62} y={BB} width={16} height={LH} rx={8} fill={CS} />
                <ellipse cx={70} cy={GND-3} rx={12} ry={6} fill={C} />
            </g>
        </>
    );
}
function CatBodyContent() {
    const C = '#E07030', CS = '#A04010';
    return (
        <>
            <SkyGround animal="cat" width={BODY_LEN} />
            {[0, TW].map(x => (
                <g key={x} transform={`translate(${x}, 0)`}>
                    <rect x={0} y={BT} width={TW+1} height={BB-BT} fill={C} />
                    <rect x={46} y={BB} width={16} height={LH} rx={8} fill={CS} />
                    <ellipse cx={54} cy={GND-3} rx={13} ry={7} fill={C} />
                </g>
            ))}
        </>
    );
}

// --- 소 (COW) ---
function CowHeadSVG() {
    const C = '#F2F0E6', CS = '#333333', CP = '#E8A0A0', CL = '#D4CEBC', HS = 9450;
    return (
        <>
            <SkyGround animal="cow" />
            <g transform={`translate(${HS},0)`}>
                <rect x={0} y={BT} width={150} height={BB-BT} fill={C} />
                <circle cx={40} cy={BT+20} r={25} fill={CS} />
                <path d="M190,210 Q210,180 240,190" fill="none" stroke={CL} strokeWidth="12" strokeLinecap="round" />
                <path d="M190,310 Q210,340 240,330" fill="none" stroke={CL} strokeWidth="12" strokeLinecap="round" />
                <rect x={160} y={BMY-65} width={100} height={130} rx={30} fill={C} />
                <ellipse cx={180} cy={BMY-75} rx={25} ry={15} fill={C} transform="rotate(-20, 180, 217)" />
                <ellipse cx={180} cy={BMY+75} rx={25} ry={15} fill={C} transform="rotate(20, 180, 303)" />
                <circle cx={215} cy={BMY-30} r={10} fill="#4a2c10" />
                <circle cx={215} cy={BMY+30} r={10} fill="#4a2c10" />
                <rect x={245} y={BMY-55} width={65} height={110} rx={30} fill={CP} />
                <circle cx={285} cy={BMY-20} r={8} fill="#C08080" />
                <circle cx={285} cy={BMY+20} r={8} fill="#C08080" />
                <rect x={68} y={BB} width={22} height={LH} rx={8} fill={CL} />
                <rect x={68} y={GND-10} width={22} height={12} rx={5} fill="#333" />
            </g>
        </>
    );
}
function CowBodyContent() {
    const C = '#F2F0E6', CS = '#111111', CL = '#D4CEBC';
    return (
        <>
            <SkyGround animal="cow" width={BODY_LEN} />
            {[0, TW].map(x => (
                <g key={x} transform={`translate(${x}, 0)`}>
                    <rect x={0} y={BT} width={TW+1} height={BB-BT} fill={C} />
                    <ellipse cx={35} cy={220} rx={30} ry={24} fill={CS} />
                    <rect x={44} y={BB} width={22} height={LH} rx={8} fill={CL} />
                    <rect x={44} y={GND-10} width={22} height={12} rx={5} fill="#333" />
                </g>
            ))}
        </>
    );
}

// --- 원숭이 (MONKEY) ---
function MonkeyHeadSVG() {
    const C = '#9A5C20', CF = '#D49560', CD = '#6A3C10', HS = 9450;
    return (
        <>
            <SkyGround animal="monkey" />
            <g transform={`translate(${HS},0)`}>
                <rect x={0} y={BT} width={150} height={BB-BT} fill={C} />
                <circle cx={210} cy={BMY-10} r={95} fill={C} />
                <ellipse cx={215} cy={BMY+8} rx={72} ry={80} fill={CF} opacity={0.75} />
                <circle cx={188} cy={BMY-28} r={16} fill="#1a0a00" />
                <circle cx={235} cy={BMY-28} r={16} fill="#1a0a00" />
                <ellipse cx={213} cy={BMY+26} rx={46} ry={36} fill={CF} />
                <rect x={63} y={BB} width={18} height={LH} rx={9} fill={CD} />
            </g>
        </>
    );
}
function MonkeyBodyContent() {
    const C = '#9A5C20', CD = '#6A3C10';
    return (
        <>
            <SkyGround animal="monkey" width={BODY_LEN} />
            {[0, TW].map(x => (
                <g key={x} transform={`translate(${x}, 0)`}>
                    <rect x={0} y={BT} width={TW+1} height={BB-BT} fill={C} />
                    <rect x={46} y={BB} width={18} height={LH} rx={9} fill={CD} />
                    <ellipse cx={55} cy={GND-3} rx={14} ry={7} fill={C} />
                </g>
            ))}
        </>
    );
}