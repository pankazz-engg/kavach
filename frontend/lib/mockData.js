// ─────────────────────────────────────────────────────────────────────────────
// Kavach Mock Data — powers the entire dashboard when backend is unavailable
// ─────────────────────────────────────────────────────────────────────────────

export const WARDS = [
    {
        wardId: 'W-12', name: 'Dharavi', city: 'Mumbai',
        riskScore: 92, category: 'WATERBORNE', isAnomaly: true,
        lat: 19.0419, lng: 72.8530, population: 85000,
        citizenReports: 47,
        forecastTrend: [55, 61, 68, 72, 78, 83, 88, 92, 95, 97, 96, 94],
        admissions: [12, 14, 18, 22, 31, 38, 45, 52, 58, 63, 67, 71],
        reasons: [
            { icon: '💧', text: 'Diarrhea cases ↑ 2.3× in last 48h', severity: 'critical' },
            { icon: '🧪', text: 'Chlorine level dropped 78% (0.18 mg/L)', severity: 'critical' },
            { icon: '🌧️', text: 'Rainfall spike 52mm — 3× monthly avg', severity: 'high' },
            { icon: '📍', text: '47 citizen complaints clustered in 0.8km radius', severity: 'high' },
            { icon: '🏥', text: 'KEM Hospital at 94% bed occupancy', severity: 'medium' },
        ],
        shapFeatures: [
            { feature: 'syndrome_spike_48h', impact: 0.38, value: '2.3×' },
            { feature: 'chlorine_drop_ratio', impact: 0.29, value: '−78%' },
            { feature: 'rainfall_lag_1d', impact: 0.18, value: '52mm' },
            { feature: 'citizen_cluster_count', impact: 0.11, value: '47' },
            { feature: 'hospital_occupancy', impact: 0.04, value: '94%' },
        ],
    },
    {
        wardId: 'W-05', name: 'Govandi', city: 'Mumbai',
        riskScore: 74, category: 'WATERBORNE', isAnomaly: false,
        lat: 19.0600, lng: 72.9200, population: 65000,
        citizenReports: 23,
        forecastTrend: [40, 44, 49, 54, 58, 63, 67, 71, 73, 74, 74, 73],
        admissions: [6, 8, 9, 11, 14, 17, 20, 23, 25, 27, 28, 29],
        reasons: [
            { icon: '💧', text: 'Waterborne syndrome cluster detected', severity: 'high' },
            { icon: '🧪', text: 'E.coli detected in 3 water samples', severity: 'high' },
            { icon: '🌧️', text: 'Post-monsoon contamination risk elevated', severity: 'medium' },
            { icon: '📍', text: '23 reports near Deonar dumping ground', severity: 'medium' },
        ],
        shapFeatures: [
            { feature: 'ecoli_detected', impact: 0.31, value: '3 samples' },
            { feature: 'syndrome_spike_48h', impact: 0.27, value: '1.8×' },
            { feature: 'rainfall_lag_1d', impact: 0.22, value: '38mm' },
            { feature: 'citizen_cluster_count', impact: 0.14, value: '23' },
            { feature: 'temperature', impact: 0.06, value: '32°C' },
        ],
    },
    {
        wardId: 'W-21', name: 'Kurla', city: 'Mumbai',
        riskScore: 58, category: 'VECTOR_BORNE', isAnomaly: false,
        lat: 19.0726, lng: 72.8796, population: 72000,
        citizenReports: 14,
        forecastTrend: [30, 33, 36, 40, 44, 48, 52, 55, 57, 58, 58, 57],
        admissions: [4, 5, 6, 7, 9, 11, 13, 15, 16, 17, 18, 18],
        reasons: [
            { icon: '🦟', text: 'Dengue fever cases ↑ 1.6× this week', severity: 'medium' },
            { icon: '🌡️', text: 'Temperature 34°C — peak mosquito breeding', severity: 'medium' },
            { icon: '💧', text: 'Stagnant water reported in 12 locations', severity: 'medium' },
            { icon: '📍', text: '14 fever cluster reports in 1.2km radius', severity: 'low' },
        ],
        shapFeatures: [
            { feature: 'fever_spike_48h', impact: 0.34, value: '1.6×' },
            { feature: 'temperature', impact: 0.28, value: '34°C' },
            { feature: 'stagnant_water_reports', impact: 0.21, value: '12 sites' },
            { feature: 'citizen_cluster_count', impact: 0.12, value: '14' },
            { feature: 'humidity', impact: 0.05, value: '88%' },
        ],
    },
    {
        wardId: 'W-08', name: 'Mankhurd', city: 'Mumbai',
        riskScore: 41, category: 'FOODBORNE', isAnomaly: false,
        lat: 19.0440, lng: 72.9360, population: 58000,
        citizenReports: 9,
        forecastTrend: [20, 22, 25, 28, 31, 34, 37, 39, 40, 41, 41, 40],
        admissions: [2, 3, 3, 4, 5, 6, 7, 8, 9, 9, 10, 10],
        reasons: [
            { icon: '🍽️', text: 'Food poisoning cluster — 3 restaurants flagged', severity: 'medium' },
            { icon: '🌡️', text: 'High ambient temperature accelerating spoilage', severity: 'low' },
            { icon: '📍', text: '9 vomiting/nausea reports in market area', severity: 'low' },
        ],
        shapFeatures: [
            { feature: 'foodborne_reports', impact: 0.42, value: '3 sites' },
            { feature: 'temperature', impact: 0.31, value: '33°C' },
            { feature: 'citizen_cluster_count', impact: 0.18, value: '9' },
            { feature: 'humidity', impact: 0.09, value: '82%' },
        ],
    },
    {
        wardId: 'W-03', name: 'Chembur', city: 'Mumbai',
        riskScore: 28, category: 'AIRBORNE', isAnomaly: false,
        lat: 19.0622, lng: 72.8990, population: 91000,
        citizenReports: 5,
        forecastTrend: [18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 28, 27],
        admissions: [2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5],
        reasons: [
            { icon: '💨', text: 'AQI elevated — PM2.5 at 145 µg/m³', severity: 'low' },
            { icon: '😷', text: 'Respiratory complaints ↑ 1.2× baseline', severity: 'low' },
        ],
        shapFeatures: [
            { feature: 'aqi_pm25', impact: 0.51, value: '145 µg/m³' },
            { feature: 'respiratory_reports', impact: 0.35, value: '1.2×' },
            { feature: 'wind_speed', impact: 0.14, value: '8 km/h' },
        ],
    },
    {
        wardId: 'W-17', name: 'Bandra', city: 'Mumbai',
        riskScore: 18, category: 'UNKNOWN', isAnomaly: false,
        lat: 19.0596, lng: 72.8295, population: 110000,
        citizenReports: 2,
        forecastTrend: [14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 18, 17],
        admissions: [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3],
        reasons: [
            { icon: '✅', text: 'No significant outbreak signals detected', severity: 'low' },
            { icon: '📊', text: 'Routine monitoring — within normal parameters', severity: 'low' },
        ],
        shapFeatures: [
            { feature: 'baseline_admissions', impact: 0.60, value: 'normal' },
            { feature: 'citizen_reports', impact: 0.40, value: '2' },
        ],
    },
];

// ── KPI Metrics ───────────────────────────────────────────────────────────────
export const KPI = {
    predictedOutbreaks: 3,
    citizensAtRisk: 222000,
    hospitalsOnSurge: 4,
    activeHotspots: 2,
    criticalAlertsToday: 5,
    totalWardsMonitored: WARDS.length,
    topCategory: 'WATERBORNE',
};

// ── 48h Forecast (hourly) ─────────────────────────────────────────────────────
export function generateForecast(ward) {
    const base = ward.riskScore;
    return Array.from({ length: 48 }, (_, i) => {
        const noise = (Math.random() - 0.4) * 4;
        const trend = i < 24 ? i * 0.15 : (48 - i) * 0.08;
        const score = Math.min(100, Math.max(0, base - 10 + trend + noise));
        const admissions = Math.round((score / 100) * 80 + Math.random() * 5);
        return {
            hour: `+${i}h`,
            riskScore: Math.round(score),
            admissions,
            threshold: 70,
        };
    });
}

// ── Category breakdown ────────────────────────────────────────────────────────
export const CATEGORY_DATA = [
    { name: 'Waterborne', value: 38, color: '#3b82f6' },
    { name: 'Vector-borne', value: 27, color: '#a855f7' },
    { name: 'Foodborne', value: 19, color: '#f59e0b' },
    { name: 'Airborne', value: 11, color: '#10b981' },
    { name: 'Hospital-acq.', value: 5, color: '#ef4444' },
];

// ── Alerts feed ───────────────────────────────────────────────────────────────
export const ALERTS = [
    {
        id: 'a1', wardId: 'W-12', wardName: 'Dharavi',
        severity: 'CRITICAL', category: 'WATERBORNE',
        message: 'Critical waterborne outbreak risk — 92% probability',
        action: 'Issue boil-water advisory immediately. Deploy rapid response team.',
        time: '2 min ago', isNew: true,
    },
    {
        id: 'a2', wardId: 'W-12', wardName: 'Dharavi',
        severity: 'CRITICAL', category: 'WATERBORNE',
        message: 'Hospital surge expected within 24h — KEM at 94% capacity',
        action: 'Activate overflow protocol. Alert neighboring hospitals.',
        time: '8 min ago', isNew: true,
    },
    {
        id: 'a3', wardId: 'W-05', wardName: 'Govandi',
        severity: 'HIGH', category: 'WATERBORNE',
        message: 'E.coli detected in municipal water supply — 3 samples',
        action: 'Shut affected supply lines. Deploy water tankers.',
        time: '23 min ago', isNew: false,
    },
    {
        id: 'a4', wardId: 'W-12', wardName: 'Dharavi',
        severity: 'HIGH', category: 'WATERBORNE',
        message: 'Boil water advisory issued for Ward-12 residents',
        action: 'Distribute water purification tablets. Set up community camps.',
        time: '1h ago', isNew: false,
    },
    {
        id: 'a5', wardId: 'W-21', wardName: 'Kurla',
        severity: 'MEDIUM', category: 'VECTOR_BORNE',
        message: 'Dengue cluster detected — 14 cases in 1.2km radius',
        action: 'Deploy fogging units. Inspect stagnant water sites.',
        time: '2h ago', isNew: false,
    },
    {
        id: 'a6', wardId: 'W-08', wardName: 'Mankhurd',
        severity: 'MEDIUM', category: 'FOODBORNE',
        message: 'Food poisoning cluster — 3 restaurants under investigation',
        action: 'Suspend licenses pending inspection. Issue public advisory.',
        time: '3h ago', isNew: false,
    },
];

// ── Admission trend (last 7 days) ─────────────────────────────────────────────
export const ADMISSION_TREND = [
    { day: 'Mon', W12: 22, W05: 8, W21: 5, total: 35 },
    { day: 'Tue', W12: 31, W05: 11, W21: 7, total: 49 },
    { day: 'Wed', W12: 38, W05: 14, W21: 9, total: 61 },
    { day: 'Thu', W12: 45, W05: 17, W21: 11, total: 73 },
    { day: 'Fri', W12: 52, W05: 20, W21: 13, total: 85 },
    { day: 'Sat', W12: 63, W05: 24, W21: 15, total: 102 },
    { day: 'Sun', W12: 71, W05: 28, W21: 17, total: 116 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getRiskLevel(score) {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
}

export const RISK_COLORS = {
    CRITICAL: { text: '#ef4444', glow: 'rgba(239,68,68,0.5)', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)' },
    HIGH: { text: '#f97316', glow: 'rgba(249,115,22,0.5)', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.4)' },
    MEDIUM: { text: '#eab308', glow: 'rgba(234,179,8,0.5)', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.4)' },
    LOW: { text: '#22c55e', glow: 'rgba(34,197,94,0.5)', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.4)' },
};

export const CATEGORY_ICON = {
    WATERBORNE: '💧', FOODBORNE: '🍽️', AIRBORNE: '💨',
    VECTOR_BORNE: '🦟', HOSPITAL_ACQUIRED: '🏥', UNKNOWN: '❓',
};
