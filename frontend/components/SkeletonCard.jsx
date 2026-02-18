'use client';

export default function SkeletonCard({ height = 80, className = '' }) {
    return (
        <div
            className={`rounded-2xl overflow-hidden ${className}`}
            style={{
                height,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                position: 'relative',
            }}
        >
            <div
                style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.8s infinite',
                }}
            />
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
}

export function SkeletonText({ width = '60%', height = 12 }) {
    return (
        <div style={{
            width, height, borderRadius: 6,
            background: 'rgba(255,255,255,0.06)',
            position: 'relative', overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.8s infinite',
            }} />
        </div>
    );
}
