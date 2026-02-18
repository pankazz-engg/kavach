import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import { getAlerts, createAlert } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Plus, CheckCircle, Filter } from 'lucide-react';

const SEVERITY_CONFIG = {
    CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-500', icon: '🚨' },
    HIGH: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-500', icon: '🔴' },
    MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-500', icon: '🟠' },
    LOW: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', dot: 'bg-green-500', icon: '🟡' },
};

const STATUS_CONFIG = {
    ACTIVE: { label: 'Active', color: 'text-red-400', bg: 'bg-red-500/10' },
    RESOLVED: { label: 'Resolved', color: 'text-green-400', bg: 'bg-green-500/10' },
    PENDING: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
};

export default function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        getAlerts()
            .then(setAlerts)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.severity === filter);

    const stats = {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'CRITICAL').length,
        high: alerts.filter(a => a.severity === 'HIGH').length,
        active: alerts.filter(a => a.status === 'ACTIVE').length,
    };

    return (
        <>
            <Head><title>Kavach — Alerts</title></Head>
            <div className="flex flex-col h-screen bg-[#0a0f1e] text-[#f9fafb] overflow-hidden">
                <Navbar alerts={alerts} />

                <main className="flex-1 overflow-y-auto p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-bold">Health Alerts</h1>
                            <p className="text-sm text-[#6b7280] mt-0.5">Active outbreak alerts across all wards</p>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total Alerts', value: stats.total, color: 'text-[#f9fafb]' },
                            { label: 'Critical', value: stats.critical, color: 'text-red-400' },
                            { label: 'High', value: stats.high, color: 'text-orange-400' },
                            { label: 'Active', value: stats.active, color: 'text-yellow-400' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4">
                                <p className="text-xs text-[#6b7280] mb-1">{label}</p>
                                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Filter tabs */}
                    <div className="flex gap-2 mb-4">
                        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${filter === f
                                        ? 'bg-[#3b82f6] text-white'
                                        : 'bg-[#111827] border border-[#1f2937] text-[#6b7280] hover:text-[#f9fafb]'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Alert list */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 text-[#6b7280]">
                            <CheckCircle size={40} className="mx-auto mb-3 text-green-500 opacity-50" />
                            <p className="font-semibold">No alerts found</p>
                            <p className="text-sm mt-1">All wards are within safe thresholds</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((alert) => {
                                const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.LOW;
                                const status = STATUS_CONFIG[alert.status] || STATUS_CONFIG.ACTIVE;
                                return (
                                    <div
                                        key={alert.id}
                                        className={`bg-[#111827] border rounded-2xl p-5 ${sev.border} hover:bg-[#1a2234] transition-colors`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${sev.dot}`} />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <span className={`text-xs font-bold ${sev.color}`}>
                                                            {sev.icon} {alert.severity}
                                                        </span>
                                                        <span className="text-xs text-[#6b7280]">·</span>
                                                        <span className="text-xs text-[#9ca3af]">{alert.outbreakCategory?.replace('_', ' ')}</span>
                                                        <span className="text-xs text-[#6b7280]">·</span>
                                                        <span className="text-xs text-[#6b7280]">{alert.ward?.name || alert.wardId}</span>
                                                    </div>
                                                    <p className="text-sm text-[#e5e7eb] leading-relaxed">{alert.message}</p>
                                                    {alert.recommendedAction && (
                                                        <div className="mt-3 bg-white/5 rounded-xl px-3 py-2">
                                                            <p className="text-xs text-[#6b7280] font-medium mb-0.5">💡 Recommended Action</p>
                                                            <p className="text-xs text-[#d1d5db]">{alert.recommendedAction}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${status.bg} ${status.color}`}>
                                                    {status.label}
                                                </span>
                                                <p className="text-[10px] text-[#6b7280] mt-1.5">
                                                    {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
