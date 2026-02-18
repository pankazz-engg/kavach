'use client';
import { ALERTS, RISK_COLORS } from '../lib/mockData';

const SEV_CONFIG = {
    CRITICAL: { label: 'CRITICAL', dot: 'bg-red-500', badge: 'bg-red-500/15 text-red-400 border-red-500/30' },
    HIGH: { label: 'HIGH', dot: 'bg-orange-500', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
    MEDIUM: { label: 'MEDIUM', dot: 'bg-yellow-500', badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    LOW: { label: 'LOW', dot: 'bg-green-500', badge: 'bg-green-500/15 text-green-400 border-green-500/30' },
};

export default function AlertsTimeline({ alerts = ALERTS, limit = 6 }) {
    const items = alerts.slice(0, limit);

    return (
        <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '100%' }}>
            {items.map((alert, i) => {
                const cfg = SEV_CONFIG[alert.severity] || SEV_CONFIG.LOW;
                const col = RISK_COLORS[alert.severity] || RISK_COLORS.LOW;

                return (
                    <div key={alert.id}
                        className="relative flex gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]
              hover:bg-white/[0.04] transition-colors group"
                        style={alert.isNew ? { boxShadow: `0 0 12px ${col.glow}` } : {}}
                    >
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center pt-1 shrink-0">
                            <div className={`w-2 h-2 rounded-full ${cfg.dot} ${alert.isNew ? 'animate-pulse' : ''}`}
                                style={{ boxShadow: alert.isNew ? `0 0 8px ${col.glow}` : 'none' }} />
                            {i < items.length - 1 && (
                                <div className="w-px flex-1 mt-1 bg-white/[0.06]" style={{ minHeight: 12 }} />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cfg.badge}`}>
                                        {cfg.label}
                                    </span>
                                    <span className="text-[10px] text-white/40 font-mono">{alert.wardId}</span>
                                    {alert.isNew && (
                                        <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1 rounded font-bold">NEW</span>
                                    )}
                                </div>
                                <span className="text-[10px] text-white/30 shrink-0">{alert.time}</span>
                            </div>
                            <p className="text-xs text-white/80 leading-snug">{alert.message}</p>
                            <p className="text-[10px] text-white/40 mt-1 leading-snug">{alert.action}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
