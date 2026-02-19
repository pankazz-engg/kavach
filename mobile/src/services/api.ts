import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync('kavach_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch { }
    return config;
});

// Global error handler — 401 clears token
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        if (error.response?.status === 401) {
            await SecureStore.deleteItemAsync('kavach_token');
        }
        return Promise.reject(error);
    }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
    register: (data: { email: string; password: string; name: string; wardId?: string }) =>
        api.post('/auth/register', { ...data, role: 'CITIZEN' }),
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    me: () => api.get('/auth/me'),
    updateDeviceToken: (fcmToken: string) =>
        api.put('/auth/device-token', { fcmToken }),
};

// ── Risk ──────────────────────────────────────────────────────────────────────
export const riskApi = {
    myWard: () => api.get('/risk/my-ward'),
    byWard: (wardId: string) => api.get(`/risk/${wardId}`),
};

// ── Alerts ────────────────────────────────────────────────────────────────────
export const alertsApi = {
    myWard: () => api.get('/alerts/my-ward'),
    byWard: (wardId: string) => api.get(`/alerts/${wardId}`),
};

// ── Citizen Reports ───────────────────────────────────────────────────────────
export const reportApi = {
    submit: (data: {
        wardId: string;
        latitude: number;
        longitude: number;
        syndromeType: string;
        severity: number;
        description?: string;
    }) => api.post('/citizen', data),
};
