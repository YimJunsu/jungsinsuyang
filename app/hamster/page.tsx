import Link from 'next/link';
import HamsterContent from '../components/HamsterContent';

export default function HamsterPage() {
  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 shrink-0"
        style={{ height: 56, background: '#1a1206', borderBottom: '1px solid rgba(217,119,6,0.2)' }}
      >
        <Link
          href="/"
          className="flex items-center justify-center rounded-xl transition-colors"
          style={{ width: 36, height: 36, color: '#fbbf24' }}
        >
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <span className="text-base font-semibold text-amber-300">🐹 햄스터 돌리기</span>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <HamsterContent />
      </div>
    </div>
  );
}
