import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Activity, Eye, EyeOff, User, Mail, Lock, MapPin } from 'lucide-react';
import { register } from '../lib/api';

const ROLE_ROUTES = {
    GOV: '/gov',
    HOSPITAL: '/hospital',
    CITIZEN: '/community',
    SUPER_ADMIN: '/admin',
};

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirm: '',
        wardId: '',
    });
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const validate = () => {
        if (!form.name.trim()) return 'Full name is required.';
        if (!form.email.trim()) return 'Email is required.';
        if (form.password.length < 8) return 'Password must be at least 8 characters.';
        if (!/[A-Z]/.test(form.password)) return 'Password must contain at least one uppercase letter.';
        if (!/[0-9]/.test(form.password)) return 'Password must contain at least one number.';
        if (form.password !== form.confirm) return 'Passwords do not match.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        const err = validate();
        if (err) { setError(err); return; }

        setLoading(true);
        try {
            const payload = {
                name: form.name,
                email: form.email,
                password: form.password,
                role: 'CITIZEN',
                ...(form.wardId && { wardId: form.wardId }),
            };
            const data = await register(payload);
            // Store token + user just like login does
            if (typeof window !== 'undefined') {
                localStorage.setItem('kavach_access_token', data.token);
                localStorage.setItem('kavach_user', JSON.stringify(data.user));
            }
            setSuccess('Account created! Redirecting…');
            setTimeout(() => router.push(ROLE_ROUTES[data.user?.role] || '/community'), 1000);
        } catch (err) {
            const msg = err?.response?.data?.error || err?.error || err?.message || 'Registration failed.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Kavach — Create Account</title>
                <meta name="description" content="Create a Kavach account to report and track disease outbreaks in your area." />
            </Head>

            <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
                {/* Background orbs */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-emerald-600/8 rounded-full blur-3xl" />
                    <div className="absolute top-3/4 right-1/2 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />
                </div>

                <div className="w-full max-w-md relative">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-violet-600 shadow-lg shadow-emerald-500/25 mb-4">
                            <Activity size={28} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Create Account</h1>
                        <p className="text-[#6b7280] text-sm mt-1">Join Kavach AI Disease Surveillance</p>
                    </div>

                    {/* Card */}
                    <div className="bg-[#121A2B] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
                        <h2 className="text-lg font-semibold text-white mb-2">Citizen Sign Up</h2>
                        <p className="text-[#6b7280] text-xs mb-6">
                            Citizen accounts are self-registered. GOV and Hospital accounts are provisioned by administrators.
                        </p>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-3 rounded-xl mb-4">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563]" />
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={set('name')}
                                        placeholder="Your full name"
                                        required
                                        className="w-full bg-[#0B1220] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563]" />
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={set('email')}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full bg-[#0B1220] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Ward ID (optional) */}
                            <div>
                                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                                    Ward ID <span className="text-[#4b5563] font-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563]" />
                                    <input
                                        type="text"
                                        value={form.wardId}
                                        onChange={set('wardId')}
                                        placeholder="Your municipal ward ID"
                                        className="w-full bg-[#0B1220] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563]" />
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={set('password')}
                                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                                        required
                                        className="w-full bg-[#0B1220] border border-white/[0.08] rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                    />
                                    <button type="button" onClick={() => setShowPw(!showPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#9ca3af]">
                                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {/* Password strength indicators */}
                                {form.password && (
                                    <div className="flex gap-3 mt-2 flex-wrap">
                                        {[
                                            { ok: form.password.length >= 8, label: '8+ chars' },
                                            { ok: /[A-Z]/.test(form.password), label: 'Uppercase' },
                                            { ok: /[0-9]/.test(form.password), label: 'Number' },
                                        ].map(({ ok, label }) => (
                                            <span key={label} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${ok
                                                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                                                    : 'border-white/[0.06] bg-white/[0.02] text-[#4b5563]'
                                                }`}>
                                                {ok ? '✓' : '○'} {label}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563]" />
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        value={form.confirm}
                                        onChange={set('confirm')}
                                        placeholder="Repeat your password"
                                        required
                                        className={`w-full bg-[#0B1220] border rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder-[#4b5563] focus:outline-none transition-colors ${form.confirm && form.confirm !== form.password
                                                ? 'border-red-500/40 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                                : 'border-white/[0.08] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                                            }`}
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#9ca3af]">
                                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {form.confirm && form.confirm !== form.password && (
                                    <p className="text-red-400 text-[10px] mt-1.5">Passwords do not match</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-emerald-600 to-violet-600 hover:from-emerald-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 mt-2"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating account…
                                    </span>
                                ) : 'Create Account'}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
                            <p className="text-[#6b7280] text-sm">
                                Already have an account?{' '}
                                <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                                    Sign in
                                </Link>
                            </p>
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
