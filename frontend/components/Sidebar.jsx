import { MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const RISK_COLOR = (score) => {
    if (score >= 0.8) return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-500' };
    if (score >= 0.6) return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500' };
    if (score >= 0.4) return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-500' };
    return { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', dot: 'bg-green-500' };
};

const RISK_LABEL = (score) => {
    if (score >= 0.8) return 'CRITICAL';
    if (score >= 0.6) return 'HIGH';
    if (score >= 0.4) return 'MEDIUM';
    return 'LOW';
};

export default function Sidebar({ heatmapData = [], selectedWard, onSelectWard }) {
    const sorted = [...heatmapData].sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0));

    return (
        <aside className="w-64 bg-kavach-surface border-r border-kavach-border flex flex-col overflow-hidden shrink-0">
            <div className="p-4 border-b border-kavach-border">
                <h2 className="text-xs font-semibold text-kavach-muted uppercase tracking-wider">Ward Risk Index</h2>
                <p className="text-xs text-kavach-muted mt-0.5">{heatmapData.length} wards monitored</p>
            </div>

            <div className="flex-1 overflow-y-auto">
                {sorted.map((ward) => {
                    const score = ward.riskScore ?? 0;
                    const colors = RISK_COLOR(score);
                    const isSelected = selectedWard?.wardId === ward.wardId;

                    return (
                        <button
                            key={ward.wardId}
                            onClick={() => onSelectWard(ward)}
                            className={`w-full text-left px-4 py-3 border-b border-kavach-border/50 transition-colors hover:bg-white/5 ${isSelected ? 'bg-kavach-accent/10 border-l-2 border-l-kavach-accent' : ''
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={11} className="text-kavach-muted" />
                                    <span className="text-xs font-medium truncate max-w-[110px]">{ward.name}</span>
                                </div>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                                    {RISK_LABEL(score)}
                                </span>
                            </div>

                            {/* Risk bar */}
                            <div className="h-1 bg-kavach-border rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${colors.dot}`}
                                    style={{ width: `${score * 100}%` }}
                                />
                            </div>

                            <div className="flex justify-between mt-1">
                                <span className="text-[10px] text-kavach-muted">{ward.outbreakCategory ?? '—'}</span>
                                <span className={`text-[10px] font-mono ${colors.text}`}>
                                    {ward.riskScore != null ? `${(ward.riskScore * 100).toFixed(0)}%` : 'N/A'}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}
