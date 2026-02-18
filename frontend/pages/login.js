import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { login } from '../lib/api';

const ROLE_ROUTES = {
    gov: '/gov',
    hospital: '/hospital',
    citizen: '/community',
};

const DEMO_CREDS = {
    gov: { email: 'gov@kavach.health', password: 'Kavach@2024', role: 'gov' },
    hospital: { email: 'hospital@kavach.health', password: 'Kavach@2024', role: 'hospital' },
    citizen: { email: 'citizen@kavach.health', password: 'Kavach@2024', role: 'citizen' },
};

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(email, password);
            if (typeof window !== 'undefined') {
                localStorage.setItem('kavach_token', data.token);
                localStorage.setItem('kavach_user', JSON.stringify(data.user));
            }
            const role = data.user?.role || 'gov';
            router.push(ROLE_ROUTES[role] || '/dashboard');
        } catch {
            // Demo mode: route by email prefix when backend is offline
            const matchedRole = Object.keys(DEMO_CREDS).find(r => DEMO_CREDS[r].email === email);
            if (matchedRole) {
                router.push(ROLE_ROUTES[matchedRole]);
            } else {
                setError('Invalid credentials. Use a demo button below to log in.');
            }
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (role) => {
        setEmail(DEMO_CREDS[role].email);
        setPassword(DEMO_CREDS[role].password);
        setError('');
    };

    const quickLogin = (role) => {
        router.push(ROLE_ROUTES[role]);
    };

    return (
        <>
            <Head>
                <title>Kavach — Login</title>
                <meta name="description" content="Kavach AI Disease Outbreak Monitor — Sign in" />
            </Head>

            <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
                {/* Background gradient orbs */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl" />
                    <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-red-600/5 rounded-full blur-3xl" />
                </div>

                <div className="w-full max-w-md relative">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-500/30 mb-4">
                            <Activity size={28} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Kavach</h1>
                        <p className="text-[#6b7280] text-sm mt-1">AI Disease Outbreak Monitor</p>
                    </div>

                    {/* Card */}
                    <div className="bg-[#121A2B] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
                        <h2 className="text-lg font-semibold text-white mb-6">Sign in to Dashboard</h2>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@kavach.health"
                                    required
                                    className="w-full bg-[#0B1220] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full bg-[#0B1220] border border-white/[0.08] rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(!showPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#9ca3af]"
                                    >
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-violet-500/20 mt-2"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Signing in...
                                    </span>
                                ) : 'Sign In'}
                            </button>
                        </form>

                        {/* Demo credentials */}
                        <div className="mt-6 pt-6 border-t border-white/[0.06]">
                            <p className="text-xs text-[#6b7280] text-center mb-3">Quick demo access (no backend required)</p>
                            <div className="flex gap-2">
                                {[
                                    { role: 'gov', label: '🗺️ GOV', color: 'text-violet-400 border-violet-500/30 bg-violet-500/10', hoverColor: 'hover:bg-violet-500/20' },
                                    { role: 'hospital', label: '🏥 HOSPITAL', color: 'text-green-400 border-green-500/30 bg-green-500/10', hoverColor: 'hover:bg-green-500/20' },
                                    { role: 'citizen', label: '👥 CITIZEN', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', hoverColor: 'hover:bg-amber-500/20' },
                                ].map(({ role, label, color, hoverColor }) => (
                                    <button
                                        key={role}
                                        onClick={() => quickLogin(role)}
                                        className={`flex-1 text-[10px] font-bold border rounded-lg py-2 transition-all ${color} ${hoverColor}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-[#4b5563] text-center mt-2">Click a role to enter demo mode directly</p>
                        </div>
                    </div>

                    <p className="text-center text-xs text-[#4b5563] mt-6">
                        Kavach · AI-Powered Disease Surveillance · v1.0
                    </p>
                </div>
            </div>
        </>
    );
}
