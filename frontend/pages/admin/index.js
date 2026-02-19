import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import { getToken, clearToken, getUser } from '../../lib/auth';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ─── Demo mode detection ───────────────────────────────────────────────────────
const isDemoMode = () =>
    typeof window !== 'undefined' &&
    !localStorage.getItem('kavach_access_token') &&
    !!sessionStorage.getItem('kavach_demo_role');

// ─── Mock data for demo mode ──────────────────────────────────────────────────
const MOCK_STATS = {
    users: { total: 124, active: 118, suspended: 6, byRole: { GOV: 12, HOSPITAL: 34, CITIZEN: 76, SUPER_ADMIN: 2 } },
    hospitals: { total: 8 },
    wards: { total: 8 },
    audit: { eventsToday: 43 },
    services: { database: 'HEALTHY', mlService: 'HEALTHY', alertEngine: 'HEALTHY' },
};
const MOCK_USERS = {
    users: [
        { id: '1', name: 'BMC Health Officer', email: 'gov@kavach.health', role: 'GOV', isActive: true, createdAt: new Date().toISOString() },
        { id: '2', name: 'KEM Hospital Admin', email: 'hospital@kavach.health', role: 'HOSPITAL', isActive: true, createdAt: new Date().toISOString() },
        { id: '3', name: 'Demo Citizen', email: 'citizen@kavach.health', role: 'CITIZEN', isActive: true, createdAt: new Date().toISOString() },
        { id: '4', name: 'Super Admin', email: 'admin@kavach.health', role: 'SUPER_ADMIN', isActive: true, createdAt: new Date().toISOString() },
    ],
    total: 4, pages: 1, page: 1,
};
const MOCK_HOSPITALS = {
    hospitals: [
        { id: '1', name: 'KEM Hospital', city: 'Mumbai', ward: { name: 'Ward 1 - Dharavi' }, capacity: 800, icuBeds: 120, isActive: true },
        { id: '2', name: 'Sion Hospital', city: 'Mumbai', ward: { name: 'Ward 2 - Kurla' }, capacity: 600, icuBeds: 80, isActive: true },
        { id: '3', name: 'Cooper Hospital', city: 'Mumbai', ward: { name: 'Ward 7 - Andheri' }, capacity: 500, icuBeds: 60, isActive: true },
    ],
    total: 3, pages: 1, page: 1,
};
const MOCK_WARDS = {
    wards: [
        { id: '1', name: 'Ward 1 - Dharavi', city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', population: 85000 },
        { id: '2', name: 'Ward 2 - Kurla', city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', population: 72000 },
        { id: '3', name: 'Ward 7 - Andheri', city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', population: 145000 },
    ],
    total: 3, pages: 1, page: 1,
};
const MOCK_AUDIT = {
    logs: [
        { id: '1', user: { email: 'admin@kavach.health', role: 'SUPER_ADMIN' }, action: 'USER_CREATE', resource: 'gov@kavach.health', ipAddress: '127.0.0.1', timestamp: new Date().toISOString() },
        { id: '2', user: { email: 'admin@kavach.health', role: 'SUPER_ADMIN' }, action: 'HOSPITAL_CREATE', resource: 'KEM Hospital', ipAddress: '127.0.0.1', timestamp: new Date().toISOString() },
        { id: '3', user: { email: 'admin@kavach.health', role: 'SUPER_ADMIN' }, action: 'ROLE_CHANGE', resource: 'hospital@kavach.health', ipAddress: '127.0.0.1', timestamp: new Date().toISOString() },
    ],
    total: 3, pages: 1, page: 1,
};

// ─── API helper ────────────────────────────────────────────────────────────────
const api = (path, opts = {}) =>
    axios({ url: `${API}${path}`, headers: { Authorization: `Bearer ${getToken()}` }, ...opts })
        .then(r => r.data)
        .catch(err => { throw err.response?.data || err; });

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color = '#60a5fa' }) {
    return (
        <div style={{
            padding: '16px 20px', borderRadius: 14,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: `0 0 20px ${color}18`,
        }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>{label}</div>
            {sub && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{sub}</div>}
        </div>
    );
}

function Badge({ children, color }) {
    const palette = {
        green: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', border: 'rgba(34,197,94,0.3)' },
        amber: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
        red: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', border: 'rgba(239,68,68,0.3)' },
        blue: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
        purple: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7', border: 'rgba(168,85,247,0.3)' },
    };
    const c = palette[color] || palette.blue;
    return (
        <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
            background: c.bg, color: c.text, border: `1px solid ${c.border}`,
            whiteSpace: 'nowrap',
        }}>{children}</span>
    );
}

const ROLE_BADGE = {
    GOV: <Badge color="blue">GOV</Badge>,
    HOSPITAL: <Badge color="purple">HOSPITAL</Badge>,
    CITIZEN: <Badge color="green">CITIZEN</Badge>,
    SUPER_ADMIN: <Badge color="amber">SUPER_ADMIN</Badge>,
};

function Pagination({ page, pages, onPage }) {
    if (pages <= 1) return null;
    return (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', paddingTop: 10 }}>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => onPage(p)} style={{
                    width: 28, height: 28, borderRadius: 6, fontSize: 12, fontWeight: 600,
                    background: p === page ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.04)',
                    border: p === page ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    color: p === page ? '#60a5fa' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                }}>{p}</button>
            ))}
        </div>
    );
}

function SectionHeader({ children }) {
    return (
        <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)', paddingBottom: 10,
            borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 14,
        }}>{children}</div>
    );
}

function TableWrapper({ children }) {
    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                {children}
            </table>
        </div>
    );
}

const TH = ({ children }) => (
    <th style={{
        padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700,
        color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>{children}</th>
);

const TD = ({ children }) => (
    <td style={{
        padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)',
        color: 'rgba(255,255,255,0.75)', verticalAlign: 'middle',
    }}>{children}</td>
);

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
            <div style={{
                background: '#0d1425', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 18, padding: 28, width: '100%', maxWidth: 480, position: 'relative',
            }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, color: '#f1f5f9' }}>{title}</div>
                {children}
                <button onClick={onClose} style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
                    fontSize: 18, cursor: 'pointer', lineHeight: 1,
                }}>✕</button>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>{label}</label>
            {children}
        </div>
    );
}

const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#f1f5f9', outline: 'none', boxSizing: 'border-box',
};

const selectStyle = { ...inputStyle };

function PrimaryBtn({ children, onClick, disabled, color = '#3b82f6' }) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: disabled ? 'rgba(255,255,255,0.05)' : `rgba(${color === '#3b82f6' ? '59,130,246' : '239,68,68'},0.2)`,
            border: `1px solid ${disabled ? 'transparent' : `${color}55`}`,
            color: disabled ? 'rgba(255,255,255,0.3)' : color,
            cursor: disabled ? 'not-allowed' : 'pointer',
        }}>{children}</button>
    );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
    { id: 'stats', label: '📊 System Overview' },
    { id: 'users', label: '👥 Users' },
    { id: 'hospitals', label: '🏥 Hospitals' },
    { id: 'wards', label: '📍 Wards' },
    { id: 'audit', label: '📋 Audit Logs' },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const router = useRouter();
    const [tab, setTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState({ users: [], total: 0, pages: 1, page: 1 });
    const [hospitals, setHospitals] = useState({ hospitals: [], total: 0, pages: 1, page: 1 });
    const [wards, setWards] = useState({ wards: [], total: 0, pages: 1, page: 1 });
    const [audit, setAudit] = useState({ logs: [], total: 0, pages: 1, page: 1 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [modal, setModal] = useState(null); // 'createUser' | 'createHospital' | 'createWard'
    const [searchUser, setSearchUser] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [form, setForm] = useState({});
    const [formErr, setFormErr] = useState('');

    const currentUser = getUser();

    const load = useCallback(async (section, params = {}) => {
        // In demo mode skip real API calls — use mock data
        if (isDemoMode()) {
            if (section === 'stats') setStats(MOCK_STATS);
            if (section === 'users') setUsers(MOCK_USERS);
            if (section === 'hospitals') setHospitals(MOCK_HOSPITALS);
            if (section === 'wards') setWards(MOCK_WARDS);
            if (section === 'audit') setAudit(MOCK_AUDIT);
            return;
        }
        setLoading(true); setError('');
        try {
            if (section === 'stats') {
                const data = await api('/api/admin/stats');
                setStats(data);
            } else if (section === 'users') {
                const q = new URLSearchParams({ page: params.page || 1, limit: 15, ...(params.role && { role: params.role }), ...(params.search && { search: params.search }) });
                const data = await api(`/api/admin/users?${q}`);
                setUsers(data);
            } else if (section === 'hospitals') {
                const q = new URLSearchParams({ page: params.page || 1, limit: 15 });
                const data = await api(`/api/admin/hospitals?${q}`);
                setHospitals(data);
            } else if (section === 'wards') {
                const q = new URLSearchParams({ page: params.page || 1, limit: 15 });
                const data = await api(`/api/admin/wards?${q}`);
                setWards(data);
            } else if (section === 'audit') {
                const q = new URLSearchParams({ page: params.page || 1, limit: 20, ...(params.action && { action: params.action }), ...(params.role && { role: params.role }) });
                const data = await api(`/api/admin/audit-logs?${q}`);
                setAudit(data);
            }
        } catch (e) {
            setError(e.error || 'Request failed');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (tab === 'stats') load('stats');
        else if (tab === 'users') load('users', { role: filterRole, search: searchUser });
        else if (tab === 'hospitals') load('hospitals');
        else if (tab === 'wards') load('wards');
        else if (tab === 'audit') load('audit', { action: filterAction, role: filterRole });
    }, [tab, load]);

    const handleLogout = () => {
        clearToken();
        router.replace('/login');
    };

    const handleUserAction = async (action, userId) => {
        try {
            if (action === 'suspend') await api(`/api/admin/users/${userId}/suspend`, { method: 'PATCH' });
            if (action === 'activate') await api(`/api/admin/users/${userId}/activate`, { method: 'PATCH' });
            load('users', { role: filterRole, search: searchUser });
        } catch (e) {
            setError(e.error || 'Action failed');
        }
    };

    const handleFormSubmit = async () => {
        setFormErr('');
        try {
            if (modal === 'createUser') {
                await api('/api/admin/users', { method: 'POST', data: form });
            } else if (modal === 'createHospital') {
                await api('/api/admin/hospitals', { method: 'POST', data: { ...form, capacity: +form.capacity, icuBeds: +form.icuBeds } });
            } else if (modal === 'createWard') {
                await api('/api/admin/wards', { method: 'POST', data: { ...form, latitude: +form.latitude, longitude: +form.longitude, population: +form.population } });
            }
            setModal(null); setForm({});
            if (modal === 'createUser') load('users');
            if (modal === 'createHospital') load('hospitals');
            if (modal === 'createWard') load('wards');
        } catch (e) {
            setFormErr(e.error || JSON.stringify(e.details || 'Failed'));
        }
    };

    // ── Check demo mode banner ──────────────────────────────────────────────
    const demoMode = isDemoMode();

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <>
            <Head>
                <title>Admin Control Room — Kavach</title>
            </Head>

            <div style={{
                minHeight: '100vh',
                background: 'radial-gradient(ellipse 120% 80% at 50% -10%, rgba(245,158,11,0.07) 0%, transparent 60%), #080d1a',
                fontFamily: "'Inter', sans-serif",
                color: '#f1f5f9',
                display: 'flex', flexDirection: 'column',
            }}>

                {/* ── Navbar ────────────────────────────────────────────────── */}
                <nav style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 24px', height: 52,
                    background: 'rgba(8,13,26,0.9)',
                    borderBottom: '1px solid rgba(245,158,11,0.15)',
                    backdropFilter: 'blur(12px)',
                    position: 'sticky', top: 0, zIndex: 50,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 800, fontSize: 15 }}>Kavach</span>
                        <Badge color="amber">SUPER ADMIN</Badge>
                        {demoMode && (
                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', fontWeight: 700 }}>
                                DEMO MODE
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{currentUser?.email}</span>
                        <button onClick={handleLogout} style={{
                            padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                            color: '#ef4444', cursor: 'pointer',
                        }}>Logout</button>
                    </div>
                </nav>

                {/* ── Body ──────────────────────────────────────────────────── */}
                <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

                    {/* Sidebar */}
                    <aside style={{
                        width: 200, flexShrink: 0,
                        background: 'rgba(0,0,0,0.2)',
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                        padding: '16px 10px',
                        display: 'flex', flexDirection: 'column', gap: 4,
                    }}>
                        {TABS.map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)} style={{
                                padding: '9px 12px', borderRadius: 9, fontSize: 12, fontWeight: 500,
                                textAlign: 'left', cursor: 'pointer', border: 'none',
                                background: tab === t.id ? 'rgba(245,158,11,0.15)' : 'transparent',
                                color: tab === t.id ? '#f59e0b' : 'rgba(255,255,255,0.45)',
                                borderLeft: tab === t.id ? '2px solid #f59e0b' : '2px solid transparent',
                                transition: 'all 0.15s',
                            }}>{t.label}</button>
                        ))}
                    </aside>

                    {/* Main content */}
                    <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                        {error && (
                            <div style={{
                                padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                color: '#ef4444', fontSize: 13,
                            }}>{error}</div>
                        )}

                        {/* ── STATS ─────────────────────────────────────────── */}
                        {tab === 'stats' && (
                            <div>
                                <SectionHeader>System Overview</SectionHeader>
                                {loading && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading…</div>}
                                {stats && (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                                            <StatCard icon="👥" label="Total Users" value={stats.users.total} color="#60a5fa" />
                                            <StatCard icon="✅" label="Active Users" value={stats.users.active} color="#22c55e" />
                                            <StatCard icon="🏥" label="Hospitals" value={stats.hospitals.total} color="#a855f7" />
                                            <StatCard icon="📍" label="Wards" value={stats.wards.total} color="#f97316" />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                                            <StatCard icon="📋" label="Audit Events Today" value={stats.audit.eventsToday} color="#f59e0b" />
                                            <StatCard icon="🚫" label="Suspended Accounts" value={stats.users.suspended} color="#ef4444" />
                                            <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Users by Role</div>
                                                {Object.entries(stats.users.byRole || {}).map(([role, count]) => (
                                                    <div key={role} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                        {ROLE_BADGE[role] || <Badge color="blue">{role}</Badge>}
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Service health */}
                                        <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                            <SectionHeader>Service Health</SectionHeader>
                                            <div style={{ display: 'flex', gap: 20 }}>
                                                {Object.entries(stats.services || {}).map(([svc, status]) => (
                                                    <div key={svc} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <div style={{
                                                            width: 7, height: 7, borderRadius: '50%',
                                                            background: status === 'HEALTHY' ? '#22c55e' : status === 'DEGRADED' ? '#f59e0b' : '#ef4444',
                                                            boxShadow: `0 0 6px ${status === 'HEALTHY' ? '#22c55e' : '#ef4444'}`,
                                                        }} />
                                                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{svc.toUpperCase()}</span>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: status === 'HEALTHY' ? '#22c55e' : '#ef4444' }}>{status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── USERS ─────────────────────────────────────────── */}
                        {tab === 'users' && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                    <SectionHeader>User Management</SectionHeader>
                                    <PrimaryBtn onClick={() => { setModal('createUser'); setForm({}); }}>+ Create User</PrimaryBtn>
                                </div>
                                {/* Filters */}
                                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                                    <input
                                        placeholder="Search email or name…"
                                        value={searchUser}
                                        onChange={e => setSearchUser(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && load('users', { role: filterRole, search: searchUser })}
                                        style={{ ...inputStyle, width: 220 }}
                                    />
                                    <select value={filterRole} onChange={e => { setFilterRole(e.target.value); load('users', { role: e.target.value, search: searchUser }); }} style={{ ...selectStyle, width: 140 }}>
                                        <option value="">All Roles</option>
                                        {['GOV', 'HOSPITAL', 'CITIZEN', 'SUPER_ADMIN'].map(r => <option key={r}>{r}</option>)}
                                    </select>
                                    <PrimaryBtn onClick={() => load('users', { role: filterRole, search: searchUser })}>Search</PrimaryBtn>
                                </div>
                                {loading ? <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading…</div> : (
                                    <>
                                        <TableWrapper>
                                            <thead>
                                                <tr><TH>Name</TH><TH>Email</TH><TH>Role</TH><TH>Status</TH><TH>Created</TH><TH>Actions</TH></tr>
                                            </thead>
                                            <tbody>
                                                {users.users.map(u => (
                                                    <tr key={u.id}>
                                                        <TD>{u.name || '—'}</TD>
                                                        <TD><span style={{ fontFamily: 'monospace', fontSize: 11 }}>{u.email}</span></TD>
                                                        <TD>{ROLE_BADGE[u.role]}</TD>
                                                        <TD>{u.isActive ? <Badge color="green">ACTIVE</Badge> : <Badge color="red">SUSPENDED</Badge>}</TD>
                                                        <TD>{new Date(u.createdAt).toLocaleDateString('en-IN')}</TD>
                                                        <TD>
                                                            <div style={{ display: 'flex', gap: 6 }}>
                                                                {u.isActive
                                                                    ? <button onClick={() => handleUserAction('suspend', u.id)} style={{ ...actionBtn, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>Suspend</button>
                                                                    : <button onClick={() => handleUserAction('activate', u.id)} style={{ ...actionBtn, color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)' }}>Activate</button>
                                                                }
                                                            </div>
                                                        </TD>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </TableWrapper>
                                        <Pagination page={users.page} pages={users.pages} onPage={p => load('users', { page: p, role: filterRole, search: searchUser })} />
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── HOSPITALS ─────────────────────────────────────── */}
                        {tab === 'hospitals' && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                    <SectionHeader>Hospital Management</SectionHeader>
                                    <PrimaryBtn onClick={() => { setModal('createHospital'); setForm({}); }}>+ Add Hospital</PrimaryBtn>
                                </div>
                                {loading ? <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading…</div> : (
                                    <>
                                        <TableWrapper>
                                            <thead><tr><TH>Name</TH><TH>City</TH><TH>Ward</TH><TH>Capacity</TH><TH>ICU Beds</TH><TH>Status</TH></tr></thead>
                                            <tbody>
                                                {hospitals.hospitals.map(h => (
                                                    <tr key={h.id}>
                                                        <TD>{h.name}</TD>
                                                        <TD>{h.city}</TD>
                                                        <TD>{h.ward?.name || '—'}</TD>
                                                        <TD>{h.capacity}</TD>
                                                        <TD>{h.icuBeds}</TD>
                                                        <TD>{h.isActive ? <Badge color="green">ACTIVE</Badge> : <Badge color="red">INACTIVE</Badge>}</TD>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </TableWrapper>
                                        <Pagination page={hospitals.page} pages={hospitals.pages} onPage={p => load('hospitals', { page: p })} />
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── WARDS ─────────────────────────────────────────── */}
                        {tab === 'wards' && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                    <SectionHeader>Ward Management</SectionHeader>
                                    <PrimaryBtn onClick={() => { setModal('createWard'); setForm({}); }}>+ Add Ward</PrimaryBtn>
                                </div>
                                {loading ? <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading…</div> : (
                                    <>
                                        <TableWrapper>
                                            <thead><tr><TH>Name</TH><TH>City</TH><TH>District</TH><TH>State</TH><TH>Population</TH></tr></thead>
                                            <tbody>
                                                {wards.wards.map(w => (
                                                    <tr key={w.id}>
                                                        <TD>{w.name}</TD>
                                                        <TD>{w.city}</TD>
                                                        <TD>{w.district}</TD>
                                                        <TD>{w.state}</TD>
                                                        <TD>{w.population?.toLocaleString() || '—'}</TD>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </TableWrapper>
                                        <Pagination page={wards.page} pages={wards.pages} onPage={p => load('wards', { page: p })} />
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── AUDIT LOGS ────────────────────────────────────── */}
                        {tab === 'audit' && (
                            <div>
                                <SectionHeader>Audit Logs</SectionHeader>
                                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                                    <input placeholder="Filter action…" value={filterAction} onChange={e => setFilterAction(e.target.value)} onKeyDown={e => e.key === 'Enter' && load('audit', { action: filterAction, role: filterRole })} style={{ ...inputStyle, width: 180 }} />
                                    <select value={filterRole} onChange={e => { setFilterRole(e.target.value); load('audit', { action: filterAction, role: e.target.value }); }} style={{ ...selectStyle, width: 140 }}>
                                        <option value="">All Roles</option>
                                        {['GOV', 'HOSPITAL', 'CITIZEN', 'SUPER_ADMIN'].map(r => <option key={r}>{r}</option>)}
                                    </select>
                                    <PrimaryBtn onClick={() => load('audit', { action: filterAction, role: filterRole })}>Apply</PrimaryBtn>
                                </div>
                                {loading ? <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading…</div> : (
                                    <>
                                        <TableWrapper>
                                            <thead><tr><TH>Time</TH><TH>User</TH><TH>Role</TH><TH>Action</TH><TH>Resource</TH><TH>IP</TH></tr></thead>
                                            <tbody>
                                                {audit.logs.map(l => (
                                                    <tr key={l.id}>
                                                        <TD><span style={{ fontFamily: 'monospace', fontSize: 10 }}>{new Date(l.timestamp).toLocaleString('en-IN')}</span></TD>
                                                        <TD>{l.user?.email || '—'}</TD>
                                                        <TD>{l.user ? ROLE_BADGE[l.user.role] : '—'}</TD>
                                                        <TD><span style={{ fontFamily: 'monospace', fontSize: 11, color: '#f59e0b' }}>{l.action}</span></TD>
                                                        <TD><span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{l.resource || '—'}</span></TD>
                                                        <TD><span style={{ fontFamily: 'monospace', fontSize: 10 }}>{l.ipAddress || '—'}</span></TD>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </TableWrapper>
                                        <Pagination page={audit.page} pages={audit.pages} onPage={p => load('audit', { page: p, action: filterAction, role: filterRole })} />
                                    </>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* ── MODALS ──────────────────────────────────────────────────── */}
            {modal === 'createUser' && (
                <Modal title="Create User" onClose={() => { setModal(null); setFormErr(''); }}>
                    <Field label="Email *"><input style={inputStyle} placeholder="user@org.in" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></Field>
                    <Field label="Full Name"><input style={inputStyle} placeholder="Name" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Field>
                    <Field label="Role *">
                        <select style={selectStyle} value={form.role || ''} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                            <option value="">Select role</option>
                            {['GOV', 'HOSPITAL', 'CITIZEN', 'SUPER_ADMIN'].map(r => <option key={r}>{r}</option>)}
                        </select>
                    </Field>
                    <Field label="Password *"><input type="password" style={inputStyle} placeholder="Min 8 chars, 1 uppercase, 1 number" value={form.password || ''} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></Field>
                    <Field label="District (GOV only)"><input style={inputStyle} placeholder="e.g. Delhi" value={form.district || ''} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} /></Field>
                    {formErr && <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 12 }}>{formErr}</div>}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <PrimaryBtn onClick={() => { setModal(null); setFormErr(''); }}>Cancel</PrimaryBtn>
                        <PrimaryBtn onClick={handleFormSubmit}>Create User</PrimaryBtn>
                    </div>
                </Modal>
            )}

            {modal === 'createHospital' && (
                <Modal title="Add Hospital" onClose={() => { setModal(null); setFormErr(''); }}>
                    <Field label="Name *"><input style={inputStyle} placeholder="Hospital name" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Field>
                    <Field label="City *"><input style={inputStyle} placeholder="City" value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></Field>
                    <Field label="Ward ID *"><input style={inputStyle} placeholder="Prisma ObjectId" value={form.wardId || ''} onChange={e => setForm(f => ({ ...f, wardId: e.target.value }))} /></Field>
                    <Field label="Total Capacity"><input type="number" style={inputStyle} value={form.capacity || ''} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} /></Field>
                    <Field label="ICU Beds"><input type="number" style={inputStyle} value={form.icuBeds || ''} onChange={e => setForm(f => ({ ...f, icuBeds: e.target.value }))} /></Field>
                    {formErr && <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 12 }}>{formErr}</div>}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <PrimaryBtn onClick={() => { setModal(null); setFormErr(''); }}>Cancel</PrimaryBtn>
                        <PrimaryBtn onClick={handleFormSubmit}>Add Hospital</PrimaryBtn>
                    </div>
                </Modal>
            )}

            {modal === 'createWard' && (
                <Modal title="Add Ward" onClose={() => { setModal(null); setFormErr(''); }}>
                    <Field label="Name *"><input style={inputStyle} placeholder="Ward name" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Field>
                    <Field label="City *"><input style={inputStyle} value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></Field>
                    <Field label="State *"><input style={inputStyle} value={form.state || ''} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></Field>
                    <Field label="District"><input style={inputStyle} value={form.district || ''} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} /></Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <Field label="Latitude"><input type="number" style={inputStyle} value={form.latitude || ''} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} /></Field>
                        <Field label="Longitude"><input type="number" style={inputStyle} value={form.longitude || ''} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} /></Field>
                    </div>
                    <Field label="Population"><input type="number" style={inputStyle} value={form.population || ''} onChange={e => setForm(f => ({ ...f, population: e.target.value }))} /></Field>
                    {formErr && <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 12 }}>{formErr}</div>}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <PrimaryBtn onClick={() => { setModal(null); setFormErr(''); }}>Cancel</PrimaryBtn>
                        <PrimaryBtn onClick={handleFormSubmit}>Add Ward</PrimaryBtn>
                    </div>
                </Modal>
            )}

            <style>{`
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
                input:focus, select:focus { border-color: rgba(59,130,246,0.5) !important; }
            `}</style>
        </>
    );
}

// Shared style for action buttons
const actionBtn = {
    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
    background: 'transparent', border: '1px solid',
    cursor: 'pointer',
};
