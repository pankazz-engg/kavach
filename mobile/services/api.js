import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// LAN IP — phone and PC must be on the same WiFi network
const API_URL = 'http://10.19.7.36:5000';

const api = axios.create({ baseURL: API_URL, timeout: 10000 });

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('kavach_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const login = (email, password) =>
    api.post('/api/auth/login', { email, password }).then(r => r.data);

export const getMyWardRisk = (wardId) =>
    api.get(`/api/risk/${wardId}`).then(r => r.data);

export const submitReport = (data) =>
    api.post('/api/citizen', data).then(r => r.data);

export const getAlerts = (wardId) =>
    api.get(`/api/alerts/${wardId}`).then(r => r.data);

export const getHeatmap = () =>
    api.get('/api/risk/heatmap').then(r => r.data);

export default api;
