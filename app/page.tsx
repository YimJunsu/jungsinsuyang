'use client';

import Link from 'next/link';
import {
  Wind, Cigarette, Gauge, Music, CheckSquare,
  Terminal, Loader2, CircleDot, Orbit,
  Hammer, ChevronRight, Hourglass, Flame,
  CloudRain, Grid3X3, Zap, PawPrint, Bug
} from 'lucide-react';

const PAGES = [
  { href: '/sand', icon: Hourglass, title: '영겁의 모래시계', desc: '모래 구경하다 인생이 모래가 됨', bg: 'from-[#1a1a05] to-[#050505]', accent: '#d4af37' },
  { href: '/smash', icon: Hammer, title: '합법적 기물파손', desc: '현실에서 못 부수는 걸 여기서라도', bg: 'from-[#1a0505] to-[#050505]', accent: '#ff4d4d' },
  { href: '/blackhole', icon: Orbit, title: '우주 쓰레기통', desc: '고민을 집어넣으면 우주가 처리해 줌 (환불 불가)', bg: 'from-[#0a051a] to-[#050505]', accent: '#a855f7' },
  { href: '/hacker', icon: Terminal, title: '해커인 척 타자 연습', desc: '초록 글씨만 봐도 개발자가 된 기분', bg: 'from-[#051a05] to-[#050505]', accent: '#00ff41' },
  { href: '/candle', icon: Flame, title: '촛불 입김 테러', desc: '후~ 하면 꺼지는데 왜 계속 켜지냐고', bg: 'from-[#1a0e05] to-[#050505]', accent: '#f97316' },
  { href: '/bubble', icon: CircleDot, title: '버블랩 중독 클리닉', desc: '손가락이 터뜨리길 멈추면 치료 완료 (못 멈춤)', bg: 'from-[#05101a] to-[#050505]', accent: '#3b82f6' },
  { href: '/rain', icon: CloudRain, title: '감성 우울 대리 서비스', desc: '직접 우울할 시간 없을 때 위탁 운영 가능', bg: 'from-[#0a1a1f] to-[#050505]', accent: '#22d3ee' },
  { href: '/airconditioner', icon: Wind, title: '에어컨 ASMR 성지', desc: '전기세 걱정 없는 쿨함, 집주인 모름', bg: 'from-[#05161a] to-[#050505]', accent: '#06b6d4' },
  { href: '/prison', icon: Grid3X3, title: '사각형 감옥 탈출 불가', desc: '탈출구는 딱 하나 — 뒤로가기 버튼', bg: 'from-[#111827] to-[#050505]', accent: '#94a3b8' },
  { href: '/hamster', icon: Gauge, title: '쳇바퀴 월요일 시뮬레이터', desc: '열심히 달려도 제자리, 월급날은 안 옴', bg: 'from-[#1a1205] to-[#050505]', accent: '#eab308' },
  { href: '/checkbox', icon: CheckSquare, title: '체크리스트 중독 재활원', desc: '체크해도 또 생김, 입원 권장', bg: 'from-[#051a0b] to-[#050505]', accent: '#22c55e' },
  { href: '/loading', icon: Loader2, title: '행복 로딩 중...', desc: '곧 도착합니다 — 2019년부터 같은 말 중', bg: 'from-[#18181b] to-[#050505]', accent: '#71717a' },
  { href: '/smoking', icon: Cigarette, title: '가상 흡연실', desc: '폐는 멀쩡, 죄책감만 0원에 드립니다', bg: 'from-[#1a0e06] to-[#050505]', accent: '#fb923c' },
  { href: '/note', icon: Music, title: '기기 기울기 오케스트라', desc: '폰을 기울이면 음악이 됩니다. 아마도', bg: 'from-[#0d0a1a] to-[#050505]', accent: '#c084fc' },
  { href: '/animal', icon: PawPrint, title: '롱동물 전시관', desc: '롱독·롱캣·롱카우·롱몽키 — 길이만큼 정신줄 분리', bg: 'from-[#051a0a] to-[#050505]', accent: '#4ade80' },
  { href: '/cockroach', icon: Bug, title: '바선생이랑 놀기', desc: '악- 더러워. 누르면 발악함', bg: 'from-[#1a0e04] to-[#050505]', accent: '#d4a00a' },
] as const;

export default function Home() {
  return (
      <div className="min-h-dvh bg-[#020202] text-zinc-100 flex flex-col items-center px-4 py-12 md:py-20 overflow-x-hidden relative">
        <div className="fixed inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

        {/* Hero Section */}
        <header className="relative z-10 text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-zinc-700 rounded-full text-[11px] tracking-[0.3em] uppercase text-zinc-300 mb-2 bg-zinc-900/80 shadow-lg">
            <Zap size={12} className="text-yellow-400 animate-pulse" />
            Mind Discipline 2026
          </div>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none italic uppercase">
            <span className="block text-white">정신</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">수양</span>
          </h1>
          <p className="max-w-md mx-auto text-zinc-400 text-xs md:text-sm font-medium tracking-[0.1em] leading-relaxed uppercase">
            의사도 몰랐던 15가지 스트레스 해소법.<br />
            부작용: 시간 낭비, 무한 재방문.
          </p>
        </header>

        {/* 3-Column Grid Container */}
        <main className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
          {PAGES.map((page) => (
              <Link
                  key={page.href}
                  href={page.href}
                  className={`group relative overflow-hidden bg-gradient-to-br ${page.bg} border-2 border-zinc-900 p-7 transition-all duration-300 hover:border-zinc-500 hover:-translate-y-1.5 active:scale-[0.97] rounded-2xl shadow-2xl`}
              >
                {/* Corner Accent */}
                <div
                    className="absolute top-0 right-0 w-16 h-16 opacity-20 group-hover:opacity-50 transition-opacity"
                    style={{
                      background: `radial-gradient(circle at top right, ${page.accent}, transparent 70%)`
                    }}
                />

                <div className="relative flex items-center gap-6">
                  <div className="flex-shrink-0 bg-black/40 p-3 rounded-xl border border-white/5 group-hover:border-white/20 transition-colors">
                    <page.icon
                        size={32}
                        strokeWidth={1.5}
                        style={{ color: page.accent }}
                        className="group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <h2 className="text-base font-black tracking-wider uppercase text-zinc-100 group-hover:text-white transition-colors italic">
                      {page.title}
                    </h2>
                    <p className="text-[12px] text-zinc-400 font-medium mt-1 truncate group-hover:text-zinc-200 transition-colors">
                      {page.desc}
                    </p>
                  </div>

                  <ChevronRight
                      size={18}
                      className="ml-auto text-zinc-700 group-hover:text-white group-hover:translate-x-1 transition-all"
                  />
                </div>

                {/* Bottom Accent Line */}
                <div
                    className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
                    style={{ backgroundColor: page.accent }}
                />
              </Link>
          ))}
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-32 mb-16 flex flex-col items-center gap-8 text-center w-full">
          <div className="w-12 h-[1px] bg-zinc-700" />

          {/* Legal Links */}
          <div className="flex items-center gap-8 text-xs tracking-widest uppercase text-zinc-400 font-bold">
            <Link href="/about" className="hover:text-white hover:underline underline-offset-4 transition-all">About</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            <Link href="/privacy" className="hover:text-white hover:underline underline-offset-4 transition-all">Privacy</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            <Link href="/terms" className="hover:text-white hover:underline underline-offset-4 transition-all">Terms</Link>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] text-zinc-500 tracking-[0.4em] uppercase font-bold">
              Meaningless actions for a meaningful rest
            </p>
            <p className="text-[9px] text-zinc-700 tracking-[0.2em] font-medium">
              © 2026 MIND DISCIPLINE. ALL VOID RESERVED.
            </p>
          </div>
        </footer>

        <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

        body {
          font-family: 'Inter', sans-serif;
          background-color: #020202;
          -webkit-font-smoothing: antialiased;
          color: #f4f4f5;
        }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #020202; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>
      </div>
  );
}