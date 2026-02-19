'use client';
import { useState, useEffect, useRef } from 'react';
import { WARDS, getRiskLevel, RISK_COLORS } from '../lib/mockData';

// Physics-based floating bubble layout
function useBubblePositions(wards) {
    const [positions, setPositions] = useState([]);

    useEffect(() => {
        // Place bubbles in a force-directed cluster pattern
        const cx = 50, cy = 50; // center %
        const placed = wards.map((ward, i) => {
            const angle = (i / wards.length) * Math.PI * 2 - Math.PI / 2;
            const radius = ward.riskScore > 70 ? 14 : ward.riskScore > 40 ? 22 : 30;
            return {
                ...ward,
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius,
                size: Math.max(60, (ward.riskScore / 100) * 160),
                animDelay: i * 0.3,
            };
        });
        // Put highest risk in center
        const sorted = [...placed].sort((a, b) => b.riskScore - a.riskScore);
        sorted[0] = { ...sorted[0], x: cx, y: cy };
        setPositions(sorted);
    }, [wards]);

    return positions;
}

export default function BubbleHotspotView({ onSelectWard, selectedWardId }) {
    const bubbles = useBubblePositions(WARDS);
    const [hovered, setHovered] = useState(null);
    const [tick, setTick] = useState(0);

    // Animate float
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 50);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden" style={{ minHeight: 420 }}>
            {/* Background grid */}
            <div className="absolute inset-0" style={{
                backgroundImage: `
          radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 70%),
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
                backgroundSize: '100% 100%, 40px 40px, 40px 40px',
            }} />

            {/* Radar rings */}
            {[1, 2, 3].map(r => (
                <div key={r} className="absolute rounded-full border border-white/[0.04] pointer-events-none"
                    style={{
                        width: `${r * 28}%`, height: `${r * 28}%`,
                        top: `${50 - r * 14}%`, left: `${50 - r * 14}%`,
                    }}
                />
            ))}

            {/* Bubbles */}
            {bubbles.map((ward, i) => {
                const level = getRiskLevel(ward.riskScore);
                const col = RISK_COLORS[level];
                const isSelected = selectedWardId === ward.wardId;
                const isHovered = hovered === ward.wardId;
                const floatY = Math.sin((tick * 0.04) + ward.animDelay * 2) * 4;
                const floatX = Math.cos((tick * 0.03) + ward.animDelay) * 2;

                return (
                    <div
                        key={ward.wardId}
                        onClick={() => onSelectWard(ward)}
                        onMouseEnter={() => setHovered(ward.wardId)}
                        onMouseLeave={() => setHovered(null)}
                        className="absolute flex flex-col items-center justify-center cursor-pointer select-none"
                        style={{
                            width: ward.size,
                            height: ward.size,
                            left: `calc(${ward.x}% - ${ward.size / 2}px)`,
                            top: `calc(${ward.y}% - ${ward.size / 2}px)`,
                            transform: `translate(${floatX}px, ${floatY}px)`,
                            transition: 'transform 0.1s linear',
                            zIndex: isSelected || isHovered ? 20 : 10,
                        }}
                    >
                        {/* Outer glow ring */}
                        <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                            style={{ background: col.glow, animationDuration: `${2 + i * 0.5}s` }}
                        />
                        {/* Bubble body */}
                        <div
                            className="absolute inset-0 rounded-full transition-all duration-300"
                            style={{
                                background: `radial-gradient(circle at 35% 35%, ${col.text}cc, ${col.text}44 50%, ${col.text}11)`,
                                boxShadow: `0 0 ${isSelected ? 60 : isHovered ? 40 : 20}px ${col.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                                border: `1.5px solid ${col.border}`,
                                transform: isSelected ? 'scale(1.08)' : isHovered ? 'scale(1.04)' : 'scale(1)',
                            }}
                        />
                        {/* Label */}
                        <div className="relative z-10 text-center pointer-events-none">
                            <div className="text-white font-bold leading-none"
                                style={{ fontSize: Math.max(10, ward.size * 0.18) }}>
                                {ward.riskScore}
                            </div>
                            <div className="text-white/80 font-medium leading-tight"
                                style={{ fontSize: Math.max(8, ward.size * 0.11) }}>
                                {ward.wardId}
                            </div>
                            {ward.size > 80 && (
                                <div className="text-white/60 leading-none"
                                    style={{ fontSize: Math.max(7, ward.size * 0.09) }}>
                                    {ward.name}
                                </div>
                            )}
                        </div>

                        {/* Tooltip */}
                        {isHovered && !isSelected && (
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30
                bg-gray-900/95 border border-white/10 rounded-xl px-3 py-2 whitespace-nowrap
                shadow-2xl backdrop-blur-sm pointer-events-none"
                                style={{ boxShadow: `0 0 20px ${col.glow}` }}
                            >
                                <div className="text-white font-semibold text-sm">{ward.name}</div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-bold text-sm" style={{ color: col.text }}>{ward.riskScore}%</span>
                                    <span className="text-white/50 text-xs">{level}</span>
                                    <span className="text-white/50 text-xs">·</span>
                                    <span className="text-white/50 text-xs">{ward.category.replace('_', ' ')}</span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Center label */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/20 text-xs tracking-widest uppercase pointer-events-none">
                Delhi Outbreak Intelligence
            </div>
        </div>
    );
}
