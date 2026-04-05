'use client';

import Link from 'next/link';
import {
  Wind, Cigarette, Gauge, Music, CheckSquare,
  Terminal, Loader2, CircleDot, Orbit,
  Hammer, ChevronRight, Hourglass, Flame,
  CloudRain, Grid3X3, Zap
} from 'lucide-react';

const PAGES = [
  { href: '/sand', icon: Hourglass, title: '영겁의 모래시계', desc: '당신의 시간이 의미 없이 퇴적되는 곳', bg: 'from-[#1a1a05] to-[#050505]', accent: '#d4af37' },
  { href: '/smash', icon: Hammer, title: '파괴적 해방', desc: '문명이라는 껍데기를 부수고 본능으로', bg: 'from-[#1a0505] to-[#050505]', accent: '#ff4d4d' },
  { href: '/blackhole', icon: Orbit, title: '심연의 아가리', desc: '고민을 던져라, 소멸은 영원할지니', bg: 'from-[#0a051a] to-[#050505]', accent: '#a855f7' },
  { href: '/hacker', icon: Terminal, title: '유령 신호 침투', desc: '가상 세계의 중추를 장악하는 쾌락', bg: 'from-[#051a05] to-[#050505]', accent: '#00ff41' },
  { href: '/candle', icon: Flame, title: '최후의 발악', desc: '꺼지기 직전 가장 찬란한 의식', bg: 'from-[#1a0e05] to-[#050505]', accent: '#f97316' },
  { href: '/bubble', icon: CircleDot, title: '강박적 파열', desc: '터뜨려야만 하는 저주받은 손가락', bg: 'from-[#05101a] to-[#050505]', accent: '#3b82f6' },
  { href: '/rain', icon: CloudRain, title: '잿빛 멜랑콜리', desc: '유리창 너머로 씻겨 내려가는 자아', bg: 'from-[#0a1a1f] to-[#050505]', accent: '#22d3ee' },
  { href: '/airconditioner', icon: Wind, title: '인공적 영점', desc: '차갑고 건조한 기계적 안식의 실현', bg: 'from-[#05161a] to-[#050505]', accent: '#06b6d4' },
  { href: '/prison', icon: Grid3X3, title: '질서의 기하학', desc: '완벽한 사각형 안에 갇힌 영혼들', bg: 'from-[#111827] to-[#050505]', accent: '#94a3b8' },
  { href: '/hamster', icon: Gauge, title: '시시포스의 굴레', desc: '달려도 닿을 수 없는 목적지를 향해', bg: 'from-[#1a1205] to-[#050505]', accent: '#eab308' },
  { href: '/checkbox', icon: CheckSquare, title: '강박의 연옥', desc: '채워지지 않는 공란의 공포', bg: 'from-[#051a0b] to-[#050505]', accent: '#22c55e' },
  { href: '/loading', icon: Loader2, title: '약속된 유토피아', desc: '곧 도착할 행복을 위한 영원한 대기', bg: 'from-[#18181b] to-[#050505]', accent: '#71717a' },
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
            이곳에서 당신의 고통은 데이터가 되고,<br />
            번뇌는 픽셀이 되어 사라집니다.
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