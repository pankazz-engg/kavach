import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ML_URL = process.env.NEXT_PUBLIC_ML_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_URL });
const mlApi = axios.create({ baseURL: ML_URL });

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('kavach_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const login = (email, password) =>
    api.post('/api/auth/login', { email, password }).then((r) => r.data);

// Heatmap (all wards + latest risk scores)
export const getHeatmap = () =>
    api.get('/api/risk/heatmap').then((r) => r.data);

// Risk prediction for a ward
export const predictRisk = (wardId) =>
    api.post('/api/risk/predict', { wardId, forecastHorizon: 48 }).then((r) => r.data);

// Latest prediction for a ward (with insight box)
export const getWardRisk = (wardId) =>
    api.get(`/api/risk/${wardId}`).then((r) => r.data);

// Hospital admissions
export const getHospitalSummary = (wardId, days = 7) =>
    api.get(`/api/hospital/${wardId}/summary?days=${days}`).then((r) => r.data);

// Water quality
export const getWaterLatest = (wardId) =>
    api.get(`/api/water/${wardId}/latest`).then((r) => r.data);

// Alerts
export const getAlerts = (wardId) =>
    api.get(`/api/alerts${wardId ? `/${wardId}` : ''}`).then((r) => r.data);

export const createAlert = (data) =>
    api.post('/api/alerts', data).then((r) => r.data);

// Wards
export const getWards = () =>
    api.get('/api/wards').then((r) => r.data);

// 48-hour Prophet forecast (from ML service)
export const getForecast = (wardId, horizon = 48) =>
    mlApi.get(`/forecast/${wardId}?horizon=${horizon}`).then((r) => r.data.points);

// Geo hotspots (DBSCAN clustering)
export const getHotspots = () =>
    api.get('/api/hotspots').then((r) => r.data);

export default api;
