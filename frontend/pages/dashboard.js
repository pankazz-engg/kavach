'use client';
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import GlowCard from '../components/GlowCard';
import AlertsTimeline from '../components/AlertsTimeline';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import ForecastChart from '../components/ForecastChart';
import CategoryDonut from '../components/CategoryDonut';
import AdmissionChart from '../components/AdmissionChart';
import { WARDS, KPI, ALERTS, RISK_COLORS, getRiskLevel, CATEGORY_ICON } from '../lib/mockData';

// BubbleHotspotView uses browser APIs — load client-side only
const BubbleHotspotView = dynamic(() => import('../components/BubbleHotspotView'), { ssr: false });

// ── Animated counter ──────────────────────────────────────────────────────────
function CountUp({ target, duration = 1500, suffix = '' }) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = target / (duration / 16);
        const id = setInterval(() => {
            start = Math.min(start + step, target);
            setVal(Math.floor(start));
            if (start >= target) clearInterval(id);
        }, 16);
        return () => clearInterval(id);
    }, [target]);
    return <>{val.toLocaleString()}{suffix}</>;
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color }) {
    const max = Math.max(...data), min = Math.min(...data);
    const w = 60, h = 24;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * h;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg width={w} height={h} className="opacity-70">
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ── Risk level badge ──────────────────────────────────────────────────────────
function RiskBadge({ score }) {
    const level = getRiskLevel(score);
    const col = RISK_COLORS[level];
    return (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
            style={{ color: col.text, borderColor: col.border, background: col.bg }}>
            {level}
        </span>
    );
}

// ── Live clock ────────────────────────────────────────────────────────────────
function LiveClock() {
    const [time, setTime] = useState('');
    useEffect(() => {
        const update = () => setTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);
    return <span className="font-mono text-xs text-white/40">{time} IST</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const [selectedWard, setSelectedWard] = useState(WARDS[0]);
    const [activeTab, setActiveTab] = useState('explain');
    const [alertCount, setAlertCount] = useState(ALERTS.filter(a => a.isNew).length);

    // Pulse new alert badge
    useEffect(() => {
        const id = setInterval(() => {
            setAlertCount(c => c); // keep reactive
        }, 5000);
        return () => clearInterval(id);
    }, []);

    const tabs = [
        { id: 'explain', label: '🔬 Why High Risk?' },
        { id: 'forecast', label: '📈 48h Forecast' },
        { id: 'admission', label: '🏥 Admissions' },
        { id: 'category', label: '🧬 Categories' },
    ];

    const sortedWards = [...WARDS].sort((a, b) => b.riskScore - a.riskScore);

    return (
        <>
            <Head>
                <title>Kavach — AI Outbreak Intelligence</title>
                <meta name="description" content="AI-powered disease outbreak prediction dashboard" />
            </Head>

            <div className="kavach-root" style={{
                minHeight: '100vh',
                background: 'radial-gradient(ellipse 120% 80% at 50% -10%, rgba(59,130,246,0.12) 0%, transparent 60%), #080d1a',
                color: '#f1f5f9',
                fontFamily: "'Inter', sans-serif",
                display: 'flex',
                flexDirection: 'column',
            }}>

                {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
                <nav style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 24px', height: 52,
                    background: 'rgba(8,13,26,0.85)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(12px)',
                    position: 'sticky', top: 0, zIndex: 50,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: 8,
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, boxShadow: '0 0 16px rgba(59,130,246,0.5)',
                        }}>⚡</div>
                        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>Kavach</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginLeft: 2 }}>AI Outbreak Monitor</span>
                    </div>

                    <div style={{ display: 'flex', gap: 4 }}>
                        {[
                            { href: '/dashboard', label: 'Overview', active: true },
                            { href: '/gov', label: 'GOV' },
                            { href: '/hospital', label: 'Hospital' },
                            { href: '/community', label: 'Community' },
                        ].map(item => (
                            <Link key={item.href} href={item.href} style={{
                                padding: '5px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                                background: item.active ? 'rgba(59,130,246,0.15)' : 'transparent',
                                border: item.active ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                                color: item.active ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                                textDecoration: 'none', cursor: 'pointer',
                            }}>{item.label}</Link>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <LiveClock />
                        <div style={{ position: 'relative' }}>
                            <span style={{ fontSize: 18, cursor: 'pointer' }}>🔔</span>
                            {alertCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: -4, right: -4,
                                    background: '#ef4444', color: 'white',
                                    fontSize: 9, fontWeight: 700, borderRadius: '50%',
                                    width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 0 8px rgba(239,68,68,0.7)',
                                    animation: 'pulse 2s infinite',
                                }}>{alertCount}</span>
                            )}
                        </div>
                        <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700,
                        }}>G</div>
                    </div>
                </nav>

                {/* ── TOP KPI STRIP ──────────────────────────────────────────────── */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 12, padding: '12px 16px 0',
                }}>
                    {[
                        { label: 'Predicted Outbreaks', value: KPI.predictedOutbreaks, suffix: '', icon: '⚠️', color: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
                        { label: 'Citizens at Risk', value: KPI.citizensAtRisk, suffix: '', icon: '👥', color: '#f97316', glow: 'rgba(249,115,22,0.3)' },
                        { label: 'Hospitals on Surge', value: KPI.hospitalsOnSurge, suffix: '', icon: '🏥', color: '#a855f7', glow: 'rgba(168,85,247,0.3)' },
                    ].map(kpi => (
                        <div key={kpi.label} style={{
                            padding: '12px 16px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 14,
                            boxShadow: `0 0 20px ${kpi.glow}`,
                            display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: `${kpi.glow}`,
                                border: `1px solid ${kpi.color}33`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 18, flexShrink: 0,
                            }}>{kpi.icon}</div>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: kpi.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                                    <CountUp target={kpi.value} />
                                </div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{kpi.label} (next 48h)</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── MAIN GRID ──────────────────────────────────────────────────── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '220px 1fr 280px',
                    gap: 12, padding: '12px 16px',
                    flex: 1, minHeight: 0,
                }}>

                    {/* ── LEFT SIDEBAR — WARD RISK INDEX ─────────────────────────── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
                        {/* Summary card */}
                        <div style={{
                            padding: '12px 14px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 14,
                        }}>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                                Ward Risk Index
                            </div>
                            {[
                                { label: 'Wards Monitored', value: KPI.totalWardsMonitored, color: '#60a5fa' },
                                { label: 'Active Hotspots', value: KPI.activeHotspots, color: '#f97316' },
                                { label: 'Critical Alerts', value: KPI.criticalAlertsToday, color: '#ef4444' },
                            ].map(m => (
                                <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{m.label}</span>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.value}</span>
                                </div>
                            ))}
                            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Top Category</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa' }}>
                                    {CATEGORY_ICON[KPI.topCategory]} {KPI.topCategory.replace('_', ' ')}
                                </div>
                            </div>
                        </div>

                        {/* Ward list */}
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 2px' }}>
                            Wards by Risk
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {sortedWards.map(ward => {
                                const level = getRiskLevel(ward.riskScore);
                                const col = RISK_COLORS[level];
                                const isSelected = selectedWard?.wardId === ward.wardId;
                                return (
                                    <div key={ward.wardId}
                                        onClick={() => setSelectedWard(ward)}
                                        style={{
                                            padding: '9px 12px',
                                            background: isSelected ? col.bg : 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${isSelected ? col.border : 'rgba(255,255,255,0.05)'}`,
                                            borderRadius: 10,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: isSelected ? `0 0 16px ${col.glow}` : 'none',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <span style={{ fontSize: 12, fontWeight: 600 }}>{ward.name}</span>
                                            <span style={{ fontSize: 13, fontWeight: 800, color: col.text }}>{ward.riskScore}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{ward.wardId}</span>
                                            <Sparkline data={ward.forecastTrend} color={col.text} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── CENTER — BUBBLE VISUALIZATION + BOTTOM PANEL ───────────── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
                        {/* Bubble cluster */}
                        <div style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 16,
                            overflow: 'hidden',
                            position: 'relative',
                            minHeight: 340,
                        }}>
                            {/* Title overlay */}
                            <div style={{
                                position: 'absolute', top: 14, left: 16, zIndex: 10,
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                                <div style={{
                                    width: 6, height: 6, borderRadius: '50%', background: '#ef4444',
                                    boxShadow: '0 0 8px rgba(239,68,68,0.8)',
                                    animation: 'pulse 1.5s infinite',
                                }} />
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.05em' }}>
                                    LIVE OUTBREAK INTELLIGENCE
                                </span>
                            </div>

                            {/* Legend */}
                            <div style={{
                                position: 'absolute', top: 14, right: 14, zIndex: 10,
                                display: 'flex', gap: 10,
                            }}>
                                {[['CRITICAL', '#ef4444'], ['HIGH', '#f97316'], ['MEDIUM', '#eab308'], ['LOW', '#22c55e']].map(([l, c]) => (
                                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}88` }} />
                                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{l}</span>
                                    </div>
                                ))}
                            </div>

                            <BubbleHotspotView
                                onSelectWard={setSelectedWard}
                                selectedWardId={selectedWard?.wardId}
                            />
                        </div>

                        {/* Bottom tab panel */}
                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 16,
                            overflow: 'hidden',
                            height: 260,
                            display: 'flex', flexDirection: 'column',
                        }}>
                            {/* Tab bar */}
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                padding: '0 12px',
                                gap: 2, flexShrink: 0,
                            }}>
                                {tabs.map(tab => (
                                    <button key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        style={{
                                            padding: '9px 12px', fontSize: 11, fontWeight: 500,
                                            background: 'transparent',
                                            border: 'none',
                                            borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                                            color: activeTab === tab.id ? '#60a5fa' : 'rgba(255,255,255,0.4)',
                                            cursor: 'pointer', transition: 'all 0.15s',
                                            marginBottom: -1,
                                        }}
                                    >{tab.label}</button>
                                ))}
                                {selectedWard && (
                                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                                            {selectedWard.wardId} · {selectedWard.name}
                                        </span>
                                        <RiskBadge score={selectedWard.riskScore} />
                                    </div>
                                )}
                            </div>

                            {/* Tab content */}
                            <div style={{ flex: 1, padding: '12px 14px', overflow: 'hidden' }}>
                                {activeTab === 'explain' && <ExplainabilityPanel ward={selectedWard} />}
                                {activeTab === 'forecast' && selectedWard && <ForecastChart ward={selectedWard} />}
                                {activeTab === 'admission' && <AdmissionChart />}
                                {activeTab === 'category' && <CategoryDonut />}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
                        {/* Selected ward detail */}
                        {selectedWard && (() => {
                            const level = getRiskLevel(selectedWard.riskScore);
                            const col = RISK_COLORS[level];
                            return (
                                <div style={{
                                    padding: '14px',
                                    background: col.bg,
                                    border: `1px solid ${col.border}`,
                                    borderRadius: 14,
                                    boxShadow: `0 0 24px ${col.glow}`,
                                    flexShrink: 0,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                        <div>
                                            <div style={{ fontSize: 15, fontWeight: 700 }}>{selectedWard.name}</div>
                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>
                                                {selectedWard.wardId} · {selectedWard.city}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 28, fontWeight: 900, color: col.text, lineHeight: 1 }}>
                                                {selectedWard.riskScore}%
                                            </div>
                                            <div style={{ fontSize: 10, color: col.text, fontWeight: 700 }}>{level}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        {[
                                            { label: 'Category', value: `${CATEGORY_ICON[selectedWard.category]} ${selectedWard.category.replace('_', ' ')}` },
                                            { label: 'Population', value: (selectedWard.population / 1000).toFixed(0) + 'K' },
                                            { label: 'Reports', value: selectedWard.citizenReports },
                                            { label: 'Anomaly', value: selectedWard.isAnomaly ? '⚡ Yes' : '— No' },
                                        ].map(m => (
                                            <div key={m.label} style={{
                                                background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '6px 8px',
                                            }}>
                                                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.label}</div>
                                                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{m.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Alerts timeline */}
                        <div style={{
                            flex: 1, minHeight: 0,
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 14,
                            display: 'flex', flexDirection: 'column',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                padding: '10px 14px 8px',
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                flexShrink: 0,
                            }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Active Alerts
                                </span>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                                    background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                }}>{ALERTS.length}</span>
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden', padding: '10px 12px' }}>
                                <AlertsTimeline />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── FOOTER ─────────────────────────────────────────────────────── */}
                <div style={{
                    padding: '8px 20px',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
                        Kavach AI Outbreak Intelligence · Mumbai Municipal Corporation · v1.0
                    </span>
                    <div style={{ display: 'flex', gap: 16 }}>
                        {[
                            { label: 'ML Service', ok: true },
                            { label: 'Data Feed', ok: true },
                            { label: 'Alerts', ok: true },
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <div style={{
                                    width: 5, height: 5, borderRadius: '50%',
                                    background: s.ok ? '#22c55e' : '#ef4444',
                                    boxShadow: s.ok ? '0 0 6px rgba(34,197,94,0.7)' : '0 0 6px rgba(239,68,68,0.7)',
                                }} />
                                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.95); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
        </>
    );
}
