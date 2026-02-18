import { RISK_COLORS, getRiskLevel } from '../lib/mockData';

export default function GlowCard({ children, className = '', intensity = 'low', onClick }) {
    const glows = {
        low: 'shadow-[0_0_20px_rgba(59,130,246,0.08)]',
        medium: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]',
        high: 'shadow-[0_0_40px_rgba(239,68,68,0.2)]',
        critical: 'shadow-[0_0_50px_rgba(239,68,68,0.35)]',
    };

    return (
        <div
            onClick={onClick}
            className={`
        relative rounded-2xl border border-white/[0.06]
        bg-gradient-to-br from-white/[0.04] to-white/[0.01]
        backdrop-blur-sm ${glows[intensity] || glows.low}
        transition-all duration-300
        ${onClick ? 'cursor-pointer hover:border-white/[0.12] hover:scale-[1.01]' : ''}
        ${className}
      `}
        >
            {/* Subtle top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-2xl" />
            {children}
        </div>
    );
}
