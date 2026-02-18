import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { login } from '../lib/api';

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
            router.push('/dashboard');
        } catch (err) {
            setError(err?.response?.data?.error || 'Invalid credentials. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (role) => {
        const creds = {
            gov: { email: 'gov@kavach.health', password: 'Kavach@2024' },
            hospital: { email: 'hospital@kavach.health', password: 'Kavach@2024' },
            citizen: { email: 'citizen@kavach.health', password: 'Kavach@2024' },
        };
        setEmail(creds[role].email);
        setPassword(creds[role].password);
    };

    return (
        <>
            <Head>
                <title>Kavach — Login</title>
            </Head>

            <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
                {/* Background gradient orbs */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
                </div>

                <div className="w-full max-w-md relative">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30 mb-4">
                            <Activity size={28} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Kavach</h1>
                        <p className="text-[#6b7280] text-sm mt-1">AI Disease Outbreak Monitor</p>
                    </div>

                    {/* Card */}
                    <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-8 shadow-2xl">
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
                                    className="w-full bg-[#0a0f1e] border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-colors"
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
                                        className="w-full bg-[#0a0f1e] border border-[#1f2937] rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-colors"
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
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 mt-2"
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
                        <div className="mt-6 pt-6 border-t border-[#1f2937]">
                            <p className="text-xs text-[#6b7280] text-center mb-3">Quick demo login</p>
                            <div className="flex gap-2">
                                {[
                                    { role: 'gov', label: 'GOV', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
                                    { role: 'hospital', label: 'HOSPITAL', color: 'text-green-400 border-green-500/30 bg-green-500/10' },
                                    { role: 'citizen', label: 'CITIZEN', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
                                ].map(({ role, label, color }) => (
                                    <button
                                        key={role}
                                        onClick={() => fillDemo(role)}
                                        className={`flex-1 text-[10px] font-bold border rounded-lg py-1.5 transition-opacity hover:opacity-80 ${color}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-xs text-[#4b5563] mt-6">
                        Kavach · AI-Powered Disease Surveillance
                    </p>
                </div>
            </div>
        </>
    );
}
