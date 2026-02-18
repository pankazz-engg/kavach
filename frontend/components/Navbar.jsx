import { AlertTriangle, Bell, Activity } from 'lucide-react';

const SEVERITY_COLOR = {
    CRITICAL: 'text-red-400',
    HIGH: 'text-orange-400',
    MEDIUM: 'text-yellow-400',
    LOW: 'text-green-400',
};

export default function Navbar({ alerts = [] }) {
    const criticalCount = alerts.filter(a => ['CRITICAL', 'HIGH'].includes(a.severity)).length;

    return (
        <header className="h-14 bg-kavach-surface border-b border-kavach-border flex items-center px-6 gap-4 shrink-0 z-10">
            {/* Logo */}
            <div className="flex items-center gap-2 mr-6">
                <div className="w-7 h-7 rounded-lg bg-kavach-accent flex items-center justify-center">
                    <Activity size={16} className="text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight">Kavach</span>
                <span className="text-kavach-muted text-xs ml-1">AI Outbreak Monitor</span>
            </div>

            <nav className="flex gap-1 text-sm">
                {['Dashboard', 'Alerts', 'Reports', 'Settings'].map((item) => (
                    <button
                        key={item}
                        className={`px-3 py-1.5 rounded-md transition-colors ${item === 'Dashboard'
                                ? 'bg-kavach-accent/20 text-kavach-accent'
                                : 'text-kavach-muted hover:text-kavach-text hover:bg-white/5'
                            }`}
                    >
                        {item}
                    </button>
                ))}
            </nav>

            <div className="ml-auto flex items-center gap-3">
                {/* Alert badge */}
                {criticalCount > 0 && (
                    <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-2.5 py-1 rounded-full">
                        <AlertTriangle size={12} />
                        <span>{criticalCount} active alert{criticalCount > 1 ? 's' : ''}</span>
                    </div>
                )}

                <button className="relative p-2 rounded-lg hover:bg-white/5 text-kavach-muted hover:text-kavach-text transition-colors">
                    <Bell size={18} />
                    {criticalCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                </button>

                <div className="w-8 h-8 rounded-full bg-kavach-accent/20 border border-kavach-accent/40 flex items-center justify-center text-xs font-semibold text-kavach-accent">
                    G
                </div>
            </div>
        </header>
    );
}
