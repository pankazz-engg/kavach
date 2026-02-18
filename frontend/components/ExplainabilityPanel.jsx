'use client';
import { RISK_COLORS, getRiskLevel } from '../lib/mockData';

const SEV_ICON = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };

export default function ExplainabilityPanel({ ward }) {
    if (!ward) return (
        <div className="flex items-center justify-center h-full text-white/30 text-sm">
            Select a ward bubble to see AI analysis
        </div>
    );

    const level = getRiskLevel(ward.riskScore).toLowerCase();
    const col = RISK_COLORS[getRiskLevel(ward.riskScore)];

    return (
        <div className="flex flex-col gap-3 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="text-xs font-bold uppercase tracking-widest text-white/40">AI Insight</div>
                <div className="flex-1 h-px bg-white/[0.06]" />
                <div className="text-[10px] px-2 py-0.5 rounded-full border font-bold"
                    style={{ color: col.text, borderColor: col.border, background: col.bg }}>
                    {getRiskLevel(ward.riskScore)}
                </div>
            </div>

            {/* Risk score bar */}
            <div>
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50">Outbreak Probability</span>
                    <span className="font-bold" style={{ color: col.text }}>{ward.riskScore}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                        style={{
                            width: `${ward.riskScore}%`,
                            background: `linear-gradient(90deg, ${col.text}88, ${col.text})`,
                            boxShadow: `0 0 8px ${col.glow}`,
                        }} />
                </div>
            </div>

            {/* Reasons */}
            <div className="flex flex-col gap-1.5">
                <div className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Key Signals</div>
                {ward.reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]
            hover:bg-white/[0.05] transition-colors">
                        <span className="text-sm shrink-0 mt-0.5">{r.icon}</span>
                        <span className="text-xs text-white/75 leading-snug">{r.text}</span>
                    </div>
                ))}
            </div>

            {/* SHAP features */}
            {ward.shapFeatures?.length > 0 && (
                <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-1.5">
                        SHAP Feature Impact
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {ward.shapFeatures.map((f, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="text-[10px] text-white/40 w-32 shrink-0 truncate font-mono">{f.feature}</div>
                                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                    <div className="h-full rounded-full"
                                        style={{
                                            width: `${f.impact * 100}%`,
                                            background: `linear-gradient(90deg, #a855f7, #3b82f6)`,
                                            boxShadow: '0 0 6px rgba(168,85,247,0.5)',
                                        }} />
                                </div>
                                <div className="text-[10px] text-white/50 w-10 text-right font-mono">{f.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Category */}
            <div className="mt-auto pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[10px] text-white/30">Category</span>
                <span className="text-xs font-semibold text-white/70">{ward.category.replace('_', ' ')}</span>
            </div>
        </div>
    );
}
