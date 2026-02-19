import { AlertTriangle, Bell, Activity, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getUser, clearToken, getRole } from '../lib/auth';
import { useEffect, useState } from 'react';

const SEVERITY_COLOR = {
    CRITICAL: 'text-red-400',
    HIGH: 'text-orange-400',
    MEDIUM: 'text-yellow-400',
    LOW: 'text-green-400',
};

export default function Navbar({ alerts = [] }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        // Sync user state from localStorage/sessionStorage
        const updateAuth = () => {
            const u = getUser();
            const demoRole = sessionStorage.getItem('kavach_demo_role');
            if (u) {
                setUser(u);
            } else if (demoRole) {
                setUser({ name: 'Demo User', role: demoRole });
            } else {
                setUser(null);
            }
        };

        updateAuth();
        // Simple polling/event listener could be added here for robust sync,
        // but for now, we rely on page reloads or mount cycles.
    }, [router.asPath]);

    const handleLogout = () => {
        clearToken();
        setUser(null);
        router.push('/');
    };

    const criticalCount = alerts.filter(a => ['CRITICAL', 'HIGH'].includes(a.severity)).length;
    const userInitial = user?.name?.charAt(0) || user?.role?.charAt(0) || '?';

    return (
        <header className="h-14 bg-kavach-surface border-b border-kavach-border flex items-center px-6 gap-4 shrink-0 z-50">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="font-bold text-lg tracking-tight mr-4">Kavach</span>
            </Link>


            <nav className="hidden md:flex gap-1 text-sm">
                {[
                    { name: 'Dashboard', path: '/dashboard' },
                    { name: 'Alerts', path: '/alerts' }
                ].map((item) => (
                    <Link
                        key={item.name}
                        href={item.path}
                        className={`px-3 py-1.5 rounded-md transition-colors ${router.pathname === item.path
                            ? 'bg-kavach-accent/20 text-kavach-accent'
                            : 'text-kavach-muted hover:text-kavach-text hover:bg-white/5'
                            }`}
                    >
                        {item.name}
                    </Link>
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

                {user ? (
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-kavach-accent/20 border border-kavach-accent/40 flex items-center justify-center text-xs font-semibold text-kavach-accent group-hover:bg-kavach-accent/30 transition-colors">
                                {userInitial.toUpperCase()}
                            </div>
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-kavach-surface border border-kavach-border rounded-lg shadow-xl py-1 z-50">
                                <div className="px-4 py-2 border-b border-kavach-border">
                                    <p className="text-sm font-medium text-kavach-text truncate">{user.name}</p>
                                    <p className="text-xs text-kavach-muted truncate">{user.role}</p>
                                </div>
                                <Link
                                    href={user.role === 'SUPER_ADMIN' ? '/admin' : user.role === 'GOV' ? '/gov' : user.role === 'HOSPITAL' ? '/hospital' : '/community'}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-kavach-muted hover:text-kavach-text hover:bg-white/5 transition-colors"
                                >
                                    <Activity size={14} />
                                    <span>My Console</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut size={14} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )
                        }
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="px-4 py-1.5 bg-kavach-accent text-black text-sm font-semibold rounded-lg hover:bg-kavach-accent/90 transition-colors"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </header>
    );
}
