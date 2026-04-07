import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="space-y-4">
        <h2 className="text-[10px] tracking-[0.4em] uppercase font-black text-zinc-500 border-b border-zinc-900 pb-3">
            {title}
        </h2>
        <div className="space-y-3 text-zinc-400 text-sm leading-relaxed">
            {children}
        </div>
    </section>
);

const CheckItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex gap-3">
        <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
        <span>{children}</span>
    </li>
);

const CrossItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex gap-3">
        <span className="text-zinc-700 font-bold shrink-0 mt-0.5">✗</span>
        <span className="text-zinc-500">{children}</span>
    </li>
);

export default function PrivacyPage() {
    return (
        <div className="min-h-dvh bg-[#020202] text-zinc-100 flex flex-col">
            <div className="fixed inset-0 opacity-[0.04] pointer-events-none
                bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

            {/* Header */}
            <header className="relative z-10 w-full flex items-center justify-between px-6 h-16
                border-b border-zinc-900 bg-black/80 backdrop-blur-md">
                <Link href="/" className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] tracking-[0.2em] uppercase font-black">홈으로</span>
                </Link>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800">
                    <ShieldCheck size={11} className="text-emerald-600" />
                    <span className="text-[9px] tracking-widest uppercase font-bold text-zinc-500">Privacy Policy</span>
                </div>
            </header>

            {/* Content */}
            <main className="relative z-10 flex-1 w-full max-w-2xl mx-auto px-6 py-16 space-y-14">

                {/* Hero */}
                <div className="space-y-3">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase text-white">
                        개인정보 처리방침
                    </h1>
                    <p className="text-zinc-500 text-xs tracking-widest uppercase">
                        Privacy Policy — 최종 업데이트: 2026년 4월
                    </p>
                </div>

                {/* TL;DR */}
                <div className="p-5 border border-emerald-900/40 rounded-2xl bg-emerald-950/20 space-y-3">
                    <p className="text-[10px] tracking-[0.4em] uppercase font-black text-emerald-700">TL;DR</p>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                        이 사이트는 <strong>아무 데이터도 수집하지 않습니다.</strong><br />
                        서버가 없고, 데이터베이스가 없고, 쿠키도 없습니다.<br />
                        바퀴벌레를 클릭한 횟수는 오직 본인 브라우저 안에만 존재합니다.
                    </p>
                </div>

                <Section title="수집하는 정보">
                    <ul className="space-y-2 list-none pl-0">
                        <CrossItem>이름, 이메일, 전화번호 등 개인 식별 정보</CrossItem>
                        <CrossItem>IP 주소 또는 위치 정보</CrossItem>
                        <CrossItem>쿠키 또는 로컬 트래킹</CrossItem>
                        <CrossItem>방문 기록, 클릭 로그, 행동 데이터</CrossItem>
                        <CrossItem>결제 정보 (유료 서비스 없음)</CrossItem>
                    </ul>
                    <p className="text-zinc-600 text-xs mt-2">
                        위 항목 중 어느 것도 수집하지 않습니다. 수집할 서버 자체가 없습니다.
                    </p>
                </Section>

                <Section title="동작 방식">
                    <ul className="space-y-2 list-none pl-0">
                        <CheckItem>모든 인터랙션은 <strong className="text-zinc-200">브라우저 내부에서만</strong> 처리됩니다.</CheckItem>
                        <CheckItem>카운터, 상태값 등은 <strong className="text-zinc-200">메모리(휘발성)</strong>에만 저장되며 새로고침 시 초기화됩니다.</CheckItem>
                        <CheckItem>효과음은 Web Audio API로 실시간 합성되며 서버 요청이 없습니다.</CheckItem>
                        <CheckItem>외부 API 호출이 없습니다. (Google Fonts CDN 제외)</CheckItem>
                    </ul>
                </Section>

                <Section title="서드파티">
                    <p>이 사이트가 로드하는 외부 리소스:</p>
                    <div className="space-y-3">
                        <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs space-y-1">
                            <p className="text-zinc-300 font-bold">Google Fonts (Inter 폰트)</p>
                            <p className="text-zinc-600">폰트 파일 로드 시 Google 서버에 요청이 발생할 수 있습니다.
                            Google의 개인정보 처리방침이 적용됩니다.</p>
                        </div>
                        <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs space-y-1">
                            <p className="text-zinc-300 font-bold">Subtle Patterns (배경 텍스처)</p>
                            <p className="text-zinc-600">배경 패턴 이미지 로드 시 외부 요청이 발생합니다.
                            별도 개인정보 수집은 없습니다.</p>
                        </div>
                    </div>
                    <p className="text-zinc-600 text-xs">위 두 가지 외에 어떠한 외부 서비스도 연동되어 있지 않습니다.</p>
                </Section>

                <Section title="쿠키 및 로컬 스토리지">
                    <p>이 사이트는 쿠키를 사용하지 않습니다. 로컬 스토리지 및 세션 스토리지도 사용하지 않습니다.</p>
                    <p>브라우저에 어떠한 데이터도 저장하지 않습니다.</p>
                </Section>

                <Section title="미성년자">
                    <p>이 사이트는 연령 제한이 없는 무해한 콘텐츠를 제공하며, 어떠한 개인정보도 수집하지 않으므로
                    미성년자 보호 관련 별도 조치가 필요 없습니다.</p>
                </Section>

                <Section title="문의">
                    <p className="text-zinc-500">
                        개인정보 관련 문의는 GitHub Issues를 통해 제출해 주세요.
                    </p>
                </Section>

            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-zinc-900 bg-black/80 backdrop-blur-md px-6 py-6
                flex items-center justify-between">
                <span className="text-[9px] text-zinc-700 tracking-[0.2em] uppercase font-medium">
                    © 2026 MIND DISCIPLINE. ALL VOID RESERVED.
                </span>
                <div className="flex items-center gap-6 text-[10px] tracking-widest uppercase text-zinc-600 font-bold">
                    <Link href="/about" className="hover:text-white transition-colors">About</Link>
                    <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                </div>
            </footer>
        </div>
    );
}
