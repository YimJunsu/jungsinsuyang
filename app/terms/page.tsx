import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

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

const LicenseRow = ({
    name, license, url, note,
}: {
    name: string; license: string; url?: string; note?: string;
}) => (
    <tr className="border-b border-zinc-900/60">
        <td className="py-2.5 pr-4 text-zinc-300 text-xs font-bold whitespace-nowrap">{name}</td>
        <td className="py-2.5 pr-4">
            <span className="inline-block px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase
                bg-zinc-900 border border-zinc-800 rounded text-emerald-600">
                {license}
            </span>
        </td>
        <td className="py-2.5 text-zinc-600 text-xs">{note}</td>
    </tr>
);

export default function TermsPage() {
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
                    <FileText size={11} className="text-zinc-500" />
                    <span className="text-[9px] tracking-widest uppercase font-bold text-zinc-500">Terms of Use</span>
                </div>
            </header>

            {/* Content */}
            <main className="relative z-10 flex-1 w-full max-w-2xl mx-auto px-6 py-16 space-y-14">

                {/* Hero */}
                <div className="space-y-3">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase text-white">
                        이용약관
                    </h1>
                    <p className="text-zinc-500 text-xs tracking-widest uppercase">
                        Terms of Use — 최종 업데이트: 2026년 4월
                    </p>
                </div>

                <Section title="서비스 이용">
                    <p>
                        Mind Discipline은 누구나 무료로 이용할 수 있습니다.
                        회원 가입, 로그인, 결제가 필요 없습니다.
                    </p>
                    <p>
                        본 서비스는 오락 및 스트레스 해소 목적으로 제공됩니다.
                        치료적 효과를 보장하지 않습니다 (효과 없음은 공식 입장입니다).
                    </p>
                </Section>

                <Section title="저작권 및 라이선스">
                    <div className="p-5 border border-zinc-800 rounded-2xl bg-zinc-950/60 space-y-4">
                        <p className="text-zinc-300 font-bold text-[13px]">
                            이 사이트에 포함된 모든 콘텐츠는 저작권 문제가 없습니다.
                        </p>

                        <div className="space-y-2 text-sm">
                            <div className="flex gap-3">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <div>
                                    <span className="text-zinc-200 font-bold">SVG 그래픽 (바퀴벌레, 햄스터 등)</span>
                                    <p className="text-zinc-500 text-xs mt-0.5">
                                        직접 제작한 오리지널 SVG 드로잉입니다. 외부 이미지·스프라이트·아이콘 팩을 사용하지 않습니다.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <div>
                                    <span className="text-zinc-200 font-bold">효과음 (사각사각 등)</span>
                                    <p className="text-zinc-500 text-xs mt-0.5">
                                        Web Audio API로 실시간 합성하여 생성합니다. 음원 파일이 존재하지 않으므로
                                        저작권 대상이 아닙니다. 무료·저작권 없음·상업적 이용 가능합니다.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <div>
                                    <span className="text-zinc-200 font-bold">배경음악 및 기타 음원 파일</span>
                                    <p className="text-zinc-500 text-xs mt-0.5">
                                        CC0 (Creative Commons Zero) 또는 저작권 만료, 혹은 상업적 이용이
                                        명시적으로 허용된 음원만을 사용합니다.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <div>
                                    <span className="text-zinc-200 font-bold">애니메이션 및 인터랙션</span>
                                    <p className="text-zinc-500 text-xs mt-0.5">
                                        모든 CSS 애니메이션과 인터랙션은 직접 작성한 코드입니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>

                <Section title="오픈소스 라이선스">
                    <p className="text-zinc-500 text-xs">이 서비스를 구성하는 오픈소스 라이브러리 및 에셋 목록입니다.</p>
                    <div className="overflow-x-auto rounded-xl border border-zinc-900">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-900 bg-zinc-950">
                                    <th className="py-2.5 px-4 text-left text-[9px] tracking-widest uppercase text-zinc-600 font-bold">패키지</th>
                                    <th className="py-2.5 px-4 text-left text-[9px] tracking-widest uppercase text-zinc-600 font-bold">라이선스</th>
                                    <th className="py-2.5 px-4 text-left text-[9px] tracking-widest uppercase text-zinc-600 font-bold">비고</th>
                                </tr>
                            </thead>
                            <tbody className="px-4">
                                {[
                                    { name: 'Next.js',          license: 'MIT',         note: '상업적 이용 가능' },
                                    { name: 'React',            license: 'MIT',         note: '상업적 이용 가능' },
                                    { name: 'Tailwind CSS',     license: 'MIT',         note: '상업적 이용 가능' },
                                    { name: 'Lucide Icons',     license: 'ISC',         note: '상업적 이용 가능' },
                                    { name: 'TypeScript',       license: 'Apache 2.0',  note: '상업적 이용 가능' },
                                    { name: 'Inter (폰트)',     license: 'OFL 1.1',     note: '상업적 이용 가능' },
                                    { name: 'Subtle Patterns',  license: 'CC Attribution', note: '저작자 표시 후 이용 가능' },
                                ].map((row) => (
                                    <tr key={row.name} className="border-b border-zinc-900/60 px-4">
                                        <td className="py-2.5 px-4 text-zinc-300 text-xs font-bold whitespace-nowrap">{row.name}</td>
                                        <td className="py-2.5 px-4">
                                            <span className="inline-block px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase
                                                bg-zinc-900 border border-zinc-800 rounded text-emerald-600">
                                                {row.license}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-zinc-600 text-xs">{row.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>

                <Section title="면책 조항">
                    <p>
                        본 서비스는 <strong className="text-zinc-300">현 상태 그대로(as-is)</strong> 제공됩니다.
                        서비스 이용으로 인한 직접적·간접적 손해에 대해 책임을 지지 않습니다.
                    </p>
                    <p>
                        스트레스 해소 효과는 보장되지 않습니다. 바퀴벌레를 100회 이상 눌러도
                        실제 바퀴벌레가 사라지지 않습니다.
                    </p>
                </Section>

                <Section title="변경사항">
                    <p>
                        본 약관은 사전 고지 없이 변경될 수 있습니다.
                        중요한 변경이 있을 경우 페이지 상단의 업데이트 날짜를 통해 확인할 수 있습니다.
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
                    <Link href="/about"   className="hover:text-white transition-colors">About</Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                </div>
            </footer>
        </div>
    );
}
