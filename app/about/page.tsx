import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';

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

const Tag = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-block px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase
        bg-zinc-900 border border-zinc-800 rounded text-zinc-500 mr-2 mb-1">
        {children}
    </span>
);

export default function AboutPage() {
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
                    <Zap size={10} className="text-yellow-500" />
                    <span className="text-[9px] tracking-widest uppercase font-bold text-zinc-500">About</span>
                </div>
            </header>

            {/* Content */}
            <main className="relative z-10 flex-1 w-full max-w-2xl mx-auto px-6 py-16 space-y-14">

                {/* Hero */}
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-none">
                        <span className="text-white">정신</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">수양</span>
                    </h1>
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
                        쓸데없는 일을 극도로 진지하게 만든 스트레스 해소 컬렉션.<br />
                        버튼 누르기, 바퀴벌레 건드리기, 모래 구경하기 — 의미 없음이 핵심입니다.
                    </p>
                </div>

                <Section title="이게 뭔가요?">
                    <p>
                        <strong className="text-zinc-200">Mind Discipline</strong>은 아무 쓸모 없는 인터랙션 13가지를 모아둔
                        브라우저 기반 미니 체험 모음입니다. 별도 설치 없이 웹에서 바로 실행되며,
                        모든 콘텐츠는 클라이언트 측에서만 동작합니다.
                    </p>
                    <p>
                        서버에 아무것도 전송되지 않습니다. 계정도 없습니다. 그냥 누릅니다.
                    </p>
                </Section>

                <Section title="만든 방식">
                    <p>모든 시각적 요소는 코드로 직접 제작했습니다.</p>
                    <ul className="space-y-2 list-none pl-0">
                        <li className="flex gap-3">
                            <span className="text-zinc-600 shrink-0">—</span>
                            <span>바퀴벌레·햄스터 등 캐릭터는 순수 <strong className="text-zinc-300">SVG</strong>로 직접 드로잉했습니다.
                            외부 이미지 파일을 사용하지 않아 저작권 문제가 전혀 없습니다.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-zinc-600 shrink-0">—</span>
                            <span>바퀴벌레 사각사각 효과음은 <strong className="text-zinc-300">Web Audio API</strong>로
                            프로그래밍하여 실시간 생성합니다. 외부 음원 파일이 없으므로 저작권 문제가 없습니다.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-zinc-600 shrink-0">—</span>
                            <span>햄스터 배경음악 및 기타 효과음은
                            <strong className="text-zinc-300"> CC0 / 저작권 만료 / 상업적 이용 허용</strong> 음원만 사용했습니다.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-zinc-600 shrink-0">—</span>
                            <span>배경 노이즈 텍스처는 <strong className="text-zinc-300">Subtle Patterns</strong>
                            (CC Attribution) 제공 패턴을 사용합니다.</span>
                        </li>
                    </ul>
                </Section>

                <Section title="사용된 오픈소스">
                    <p className="text-zinc-500 text-xs mb-3">아래 라이브러리 모두 상업적 이용 가능한 오픈소스 라이선스입니다.</p>
                    <div className="flex flex-wrap gap-0">
                        {[
                            ['Next.js', 'MIT'],
                            ['React', 'MIT'],
                            ['Tailwind CSS', 'MIT'],
                            ['Lucide Icons', 'ISC'],
                            ['Inter Font', 'OFL'],
                            ['TypeScript', 'Apache 2.0'],
                        ].map(([name, license]) => (
                            <span key={name} className="inline-flex items-center gap-1.5 mr-3 mb-2">
                                <Tag>{name}</Tag>
                                <span className="text-[10px] text-zinc-600">{license}</span>
                            </span>
                        ))}
                    </div>
                </Section>

                <Section title="저작권 안내">
                    <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-950/60 space-y-3">
                        <p className="text-zinc-300">
                            이 사이트에 사용된 <strong>모든 에셋은 저작권 문제가 없습니다.</strong>
                        </p>
                        <ul className="space-y-2 text-[13px]">
                            <li className="flex gap-2">
                                <span className="text-emerald-600 shrink-0 font-bold">✓</span>
                                <span>SVG 그래픽 — 직접 제작, 독자 저작물</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-600 shrink-0 font-bold">✓</span>
                                <span>효과음 — Web Audio API 실시간 생성 (저작물 아님)</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-600 shrink-0 font-bold">✓</span>
                                <span>배경음악 — CC0 또는 상업적 이용 허용 음원</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-600 shrink-0 font-bold">✓</span>
                                <span>프레임워크/라이브러리 — MIT, ISC, Apache 2.0 등 상업적 이용 허용</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-600 shrink-0 font-bold">✓</span>
                                <span>폰트 (Inter) — SIL Open Font License 1.1</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-600 shrink-0 font-bold">✓</span>
                                <span>배경 패턴 — CC Attribution (Subtle Patterns)</span>
                            </li>
                        </ul>
                    </div>
                </Section>

                <Section title="연락처">
                    <p className="text-zinc-500 text-sm">
                        문의 사항은 GitHub Issues 또는 이메일로 보내주세요.<br />
                        <span className="text-zinc-600 text-xs">버그 제보, 개선 요청 모두 환영합니다.</span>
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
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="/terms"   className="hover:text-white transition-colors">Terms</Link>
                </div>
            </footer>
        </div>
    );
}
