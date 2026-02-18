// ─────────────────────────────────────────────────────────────────────────────
// Kavach Mock Data — deterministic, powers all dashboards when backend offline
// ─────────────────────────────────────────────────────────────────────────────

export const WARDS = [
    {
        wardId: 'W-12', name: 'Dharavi', city: 'Mumbai', district: 'Mumbai City',
        riskScore: 92, category: 'WATERBORNE', isAnomaly: true,
        lat: 19.0419, lng: 72.8530, population: 85000, citizenReports: 47,
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
        confidence: 94,
    },
    {
        wardId: 'W-05', name: 'Govandi', city: 'Mumbai', district: 'Mumbai Suburban',
        riskScore: 74, category: 'WATERBORNE', isAnomaly: false,
        lat: 19.0600, lng: 72.9200, population: 65000, citizenReports: 23,
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
        confidence: 81,
    },
    {
        wardId: 'W-21', name: 'Kurla', city: 'Mumbai', district: 'Mumbai Suburban',
        riskScore: 58, category: 'VECTOR_BORNE', isAnomaly: false,
        lat: 19.0726, lng: 72.8796, population: 72000, citizenReports: 14,
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
        confidence: 73,
    },
    {
        wardId: 'W-08', name: 'Mankhurd', city: 'Mumbai', district: 'Mumbai City',
        riskScore: 41, category: 'FOODBORNE', isAnomaly: false,
        lat: 19.0440, lng: 72.9360, population: 58000, citizenReports: 9,
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
        confidence: 67,
    },
    {
        wardId: 'W-03', name: 'Chembur', city: 'Mumbai', district: 'Mumbai Suburban',
        riskScore: 28, category: 'AIRBORNE', isAnomaly: false,
        lat: 19.0622, lng: 72.8990, population: 91000, citizenReports: 5,
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
        confidence: 58,
    },
    {
        wardId: 'W-17', name: 'Bandra', city: 'Mumbai', district: 'Mumbai Suburban',
        riskScore: 18, category: 'UNKNOWN', isAnomaly: false,
        lat: 19.0596, lng: 72.8295, population: 110000, citizenReports: 2,
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
        confidence: 45,
    },
    {
        wardId: 'W-31', name: 'Andheri East', city: 'Mumbai', district: 'Mumbai Suburban',
        riskScore: 67, category: 'VECTOR_BORNE', isAnomaly: true,
        lat: 19.1136, lng: 72.8697, population: 95000, citizenReports: 31,
        forecastTrend: [38, 42, 47, 51, 55, 59, 63, 66, 67, 68, 67, 65],
        admissions: [7, 9, 11, 13, 16, 19, 22, 25, 27, 28, 29, 30],
        reasons: [
            { icon: '🦟', text: 'Malaria cases ↑ 2.1× — monsoon breeding surge', severity: 'high' },
            { icon: '🌧️', text: 'Waterlogging in 8 low-lying areas', severity: 'high' },
            { icon: '📍', text: '31 fever reports near MIDC industrial zone', severity: 'medium' },
        ],
        shapFeatures: [
            { feature: 'malaria_spike_48h', impact: 0.41, value: '2.1×' },
            { feature: 'waterlogging_sites', impact: 0.29, value: '8 areas' },
            { feature: 'citizen_cluster_count', impact: 0.19, value: '31' },
            { feature: 'humidity', impact: 0.11, value: '91%' },
        ],
        confidence: 79,
    },
    {
        wardId: 'W-44', name: 'Malad West', city: 'Mumbai', district: 'Mumbai Suburban',
        riskScore: 49, category: 'WATERBORNE', isAnomaly: false,
        lat: 19.1872, lng: 72.8484, population: 78000, citizenReports: 17,
        forecastTrend: [25, 28, 31, 35, 38, 41, 44, 46, 48, 49, 49, 48],
        admissions: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 12],
        reasons: [
            { icon: '💧', text: 'Turbidity spike in municipal supply', severity: 'medium' },
            { icon: '📍', text: '17 gastroenteritis reports in Malad slum', severity: 'medium' },
            { icon: '🌧️', text: 'Sewage overflow risk post-rainfall', severity: 'low' },
        ],
        shapFeatures: [
            { feature: 'turbidity_spike', impact: 0.38, value: '4.2 NTU' },
            { feature: 'gastro_reports', impact: 0.32, value: '17' },
            { feature: 'rainfall_lag_1d', impact: 0.20, value: '28mm' },
            { feature: 'citizen_cluster_count', impact: 0.10, value: '17' },
        ],
        confidence: 64,
    },
    {
        wardId: 'W-09', name: 'Ghatkopar', city: 'Mumbai', district: 'Mumbai Suburban',
        riskScore: 35, category: 'FOODBORNE', isAnomaly: false,
        lat: 19.0863, lng: 72.9080, population: 68000, citizenReports: 7,
        forecastTrend: [18, 20, 22, 24, 27, 29, 31, 33, 34, 35, 35, 34],
        admissions: [2, 2, 3, 3, 4, 5, 5, 6, 6, 7, 7, 7],
        reasons: [
            { icon: '🍽️', text: 'Street food contamination cluster — 2 stalls', severity: 'medium' },
            { icon: '🌡️', text: 'Heat index 38°C — food safety risk elevated', severity: 'low' },
        ],
        shapFeatures: [
            { feature: 'foodborne_reports', impact: 0.48, value: '2 stalls' },
            { feature: 'heat_index', impact: 0.35, value: '38°C' },
            { feature: 'citizen_cluster_count', impact: 0.17, value: '7' },
        ],
        confidence: 55,
    },
    {
        wardId: 'W-55', name: 'Borivali', city: 'Mumbai', district: 'Mumbai Suburban',
        riskScore: 22, category: 'AIRBORNE', isAnomaly: false,
        lat: 19.2307, lng: 72.8567, population: 88000, citizenReports: 3,
        forecastTrend: [15, 16, 17, 18, 19, 20, 21, 21, 22, 22, 22, 21],
        admissions: [1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3],
        reasons: [
            { icon: '💨', text: 'Mild AQI increase — PM10 at 98 µg/m³', severity: 'low' },
            { icon: '✅', text: 'No outbreak signals — routine monitoring', severity: 'low' },
        ],
        shapFeatures: [
            { feature: 'aqi_pm10', impact: 0.55, value: '98 µg/m³' },
            { feature: 'respiratory_reports', impact: 0.45, value: '1.1×' },
        ],
        confidence: 42,
    },
    {
        wardId: 'W-62', name: 'Vikhroli', city: 'Mumbai', district: 'Mumbai Suburban',
        riskScore: 53, category: 'WATERBORNE', isAnomaly: false,
        lat: 19.1075, lng: 72.9264, population: 61000, citizenReports: 19,
        forecastTrend: [28, 31, 34, 38, 41, 44, 47, 50, 52, 53, 53, 52],
        admissions: [3, 4, 5, 6, 7, 8, 9, 10, 11, 11, 12, 12],
        reasons: [
            { icon: '💧', text: 'Pipeline leakage contamination suspected', severity: 'medium' },
            { icon: '📍', text: '19 diarrhea cases reported near pipeline route', severity: 'medium' },
        ],
        shapFeatures: [
            { feature: 'pipeline_contamination', impact: 0.44, value: 'suspected' },
            { feature: 'diarrhea_reports', impact: 0.36, value: '19' },
            { feature: 'citizen_cluster_count', impact: 0.20, value: '19' },
        ],
        confidence: 70,
    },
    {
        wardId: 'W-77', name: 'Mulund', city: 'Mumbai', district: 'Mumbai Suburban',
        riskScore: 31, category: 'VECTOR_BORNE', isAnomaly: false,
        lat: 19.1726, lng: 72.9564, population: 74000, citizenReports: 6,
        forecastTrend: [18, 20, 22, 24, 26, 27, 28, 29, 30, 31, 31, 30],
        admissions: [2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5],
        reasons: [
            { icon: '🦟', text: 'Chikungunya cluster — 6 confirmed cases', severity: 'low' },
            { icon: '🌡️', text: 'Temperature 33°C — moderate breeding risk', severity: 'low' },
        ],
        shapFeatures: [
            { feature: 'chikungunya_cases', impact: 0.52, value: '6 cases' },
            { feature: 'temperature', impact: 0.31, value: '33°C' },
            { feature: 'citizen_cluster_count', impact: 0.17, value: '6' },
        ],
        confidence: 51,
    },
    {
        wardId: 'W-88', name: 'Kandivali', city: 'Mumbai', district: 'Mumbai Suburban',
        riskScore: 44, category: 'FOODBORNE', isAnomaly: false,
        lat: 19.2094, lng: 72.8526, population: 82000, citizenReports: 11,
        forecastTrend: [22, 25, 28, 31, 34, 37, 39, 41, 43, 44, 44, 43],
        admissions: [2, 3, 4, 4, 5, 6, 7, 7, 8, 8, 9, 9],
        reasons: [
            { icon: '🍽️', text: 'Mass food poisoning event — wedding banquet', severity: 'medium' },
            { icon: '📍', text: '11 cases traced to single catering unit', severity: 'medium' },
        ],
        shapFeatures: [
            { feature: 'mass_foodborne_event', impact: 0.56, value: '1 event' },
            { feature: 'citizen_cluster_count', impact: 0.28, value: '11' },
            { feature: 'temperature', impact: 0.16, value: '34°C' },
        ],
        confidence: 72,
    },
    {
        wardId: 'W-94', name: 'Santacruz', city: 'Mumbai', district: 'Mumbai Suburban',
        riskScore: 15, category: 'UNKNOWN', isAnomaly: false,
        lat: 19.0821, lng: 72.8416, population: 96000, citizenReports: 1,
        forecastTrend: [12, 12, 13, 13, 14, 14, 14, 15, 15, 15, 15, 14],
        admissions: [1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        reasons: [
            { icon: '✅', text: 'All indicators within safe thresholds', severity: 'low' },
        ],
        shapFeatures: [
            { feature: 'baseline_admissions', impact: 0.70, value: 'normal' },
            { feature: 'citizen_reports', impact: 0.30, value: '1' },
        ],
        confidence: 38,
    },
    {
        wardId: 'W-99', name: 'Colaba', city: 'Mumbai', district: 'Mumbai City',
        riskScore: 11, category: 'UNKNOWN', isAnomaly: false,
        lat: 18.9067, lng: 72.8147, population: 45000, citizenReports: 0,
        forecastTrend: [9, 9, 10, 10, 10, 11, 11, 11, 11, 11, 11, 10],
        admissions: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        reasons: [
            { icon: '✅', text: 'No disease signals detected', severity: 'low' },
        ],
        shapFeatures: [
            { feature: 'baseline_admissions', impact: 0.80, value: 'normal' },
            { feature: 'citizen_reports', impact: 0.20, value: '0' },
        ],
        confidence: 30,
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

// ── 48h Forecast (deterministic per ward) ────────────────────────────────────
export function generateForecast(ward) {
    const base = ward.riskScore;
    // Use ward index as seed for deterministic output
    const seed = ward.wardId.charCodeAt(2) || 42;
    return Array.from({ length: 48 }, (_, i) => {
        const noise = ((seed * (i + 1) * 7919) % 100) / 100 * 6 - 2.5;
        const trend = i < 24 ? i * 0.15 : (48 - i) * 0.08;
        const score = Math.min(100, Math.max(0, base - 10 + trend + noise));
        const admissions = Math.round((score / 100) * 80 + ((seed * i) % 5));
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
        id: 'a4', wardId: 'W-31', wardName: 'Andheri East',
        severity: 'HIGH', category: 'VECTOR_BORNE',
        message: 'Malaria cluster detected — 2.1× spike in fever cases',
        action: 'Deploy fogging units. Drain waterlogged areas.',
        time: '45 min ago', isNew: false,
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
    {
        id: 'a7', wardId: 'W-88', wardName: 'Kandivali',
        severity: 'MEDIUM', category: 'FOODBORNE',
        message: 'Mass food poisoning at wedding banquet — 11 cases',
        action: 'Trace catering unit. Issue food safety advisory.',
        time: '4h ago', isNew: false,
    },
];

// ── Admission trend (last 7 days) ─────────────────────────────────────────────
export const ADMISSION_TREND = [
    { day: 'Mon', W12: 22, W05: 8, W21: 5, W31: 7, total: 42 },
    { day: 'Tue', W12: 31, W05: 11, W21: 7, W31: 9, total: 58 },
    { day: 'Wed', W12: 38, W05: 14, W21: 9, W31: 11, total: 72 },
    { day: 'Thu', W12: 45, W05: 17, W21: 11, W31: 13, total: 86 },
    { day: 'Fri', W12: 52, W05: 20, W21: 13, W31: 16, total: 101 },
    { day: 'Sat', W12: 63, W05: 24, W21: 15, W31: 19, total: 121 },
    { day: 'Sun', W12: 71, W05: 28, W21: 17, W31: 22, total: 138 },
];

// ── GOV District Data ─────────────────────────────────────────────────────────
export const GOV_DISTRICT_DATA = [
    {
        district: 'Mumbai City',
        wards: 4, avgRisk: 41, criticalWards: 1,
        population: 288000, citizensAtRisk: 85000,
        resources: { beds: 420, available: 26, ambulances: 18, medicines: 72 },
        trend: 'rising',
    },
    {
        district: 'Mumbai Suburban',
        wards: 11, avgRisk: 38, criticalWards: 1,
        population: 890000, citizensAtRisk: 137000,
        resources: { beds: 1240, available: 89, ambulances: 42, medicines: 68 },
        trend: 'stable',
    },
];

export const RESOURCE_PREDICTION = [
    { resource: 'ICU Beds', current: 115, predicted72h: 148, unit: 'beds', critical: 140 },
    { resource: 'ORS Packets', current: 12400, predicted72h: 18600, unit: 'packets', critical: 15000 },
    { resource: 'Ambulances', current: 60, predicted72h: 60, unit: 'units', critical: 55 },
    { resource: 'Rapid Test Kits', current: 3200, predicted72h: 5100, unit: 'kits', critical: 4000 },
    { resource: 'Chlorine Tablets', current: 8900, predicted72h: 14200, unit: 'tablets', critical: 10000 },
];

// ── Hospital Data ─────────────────────────────────────────────────────────────
export const HOSPITALS = [
    {
        id: 'H-01', name: 'KEM Hospital', ward: 'W-12', wardName: 'Dharavi',
        totalBeds: 1800, occupiedBeds: 1692, icuTotal: 120, icuOccupied: 113,
        admissionsToday: 71, dischargeToday: 24,
        surgeAlert: true, surgeLevel: 'CRITICAL',
        icuTrend: [78, 81, 84, 87, 89, 91, 93, 94],
        admissionTrend: [38, 45, 52, 58, 63, 67, 71, 74],
    },
    {
        id: 'H-02', name: 'Rajawadi Hospital', ward: 'W-31', wardName: 'Andheri East',
        totalBeds: 650, occupiedBeds: 546, icuTotal: 48, icuOccupied: 38,
        admissionsToday: 30, dischargeToday: 18,
        surgeAlert: true, surgeLevel: 'HIGH',
        icuTrend: [62, 65, 68, 71, 73, 76, 78, 79],
        admissionTrend: [19, 22, 25, 27, 28, 29, 30, 31],
    },
    {
        id: 'H-03', name: 'Sion Hospital', ward: 'W-05', wardName: 'Govandi',
        totalBeds: 1500, occupiedBeds: 1110, icuTotal: 90, icuOccupied: 63,
        admissionsToday: 29, dischargeToday: 21,
        surgeAlert: false, surgeLevel: 'MEDIUM',
        icuTrend: [55, 57, 59, 61, 63, 65, 68, 70],
        admissionTrend: [17, 20, 23, 25, 27, 28, 29, 30],
    },
    {
        id: 'H-04', name: 'Cooper Hospital', ward: 'W-44', wardName: 'Malad West',
        totalBeds: 900, occupiedBeds: 594, icuTotal: 60, icuOccupied: 36,
        admissionsToday: 12, dischargeToday: 14,
        surgeAlert: false, surgeLevel: 'LOW',
        icuTrend: [48, 50, 52, 54, 56, 58, 60, 60],
        admissionTrend: [8, 9, 10, 11, 11, 12, 12, 12],
    },
];

export const ICU_FORECAST = Array.from({ length: 48 }, (_, i) => ({
    hour: `+${i}h`,
    kem: Math.min(100, 94 + Math.round(i * 0.08 + ((i * 7) % 3))),
    rajawadi: Math.min(100, 79 + Math.round(i * 0.05 + ((i * 5) % 2))),
    sion: Math.min(100, 70 + Math.round(i * 0.04 + ((i * 3) % 2))),
    threshold: 90,
})).filter((_, i) => i % 4 === 0);

// ── Community Data ────────────────────────────────────────────────────────────
export const SYMPTOM_TREND = [
    { day: 'Mon', diarrhea: 12, fever: 8, vomiting: 5, respiratory: 3 },
    { day: 'Tue', diarrhea: 18, fever: 11, vomiting: 7, respiratory: 4 },
    { day: 'Wed', diarrhea: 24, fever: 14, vomiting: 9, respiratory: 5 },
    { day: 'Thu', diarrhea: 31, fever: 17, vomiting: 12, respiratory: 6 },
    { day: 'Fri', diarrhea: 38, fever: 21, vomiting: 15, respiratory: 7 },
    { day: 'Sat', diarrhea: 45, fever: 26, vomiting: 18, respiratory: 8 },
    { day: 'Sun', diarrhea: 52, fever: 31, vomiting: 22, respiratory: 9 },
];

export const ADVISORIES = [
    {
        id: 'adv1', type: 'WATER', icon: '💧', severity: 'critical',
        title: 'Boil Water Advisory — Dharavi',
        body: 'Boil all drinking water for at least 1 minute. Do not use tap water directly.',
        issued: '2 hours ago', expires: '72 hours',
    },
    {
        id: 'adv2', type: 'FOOD', icon: '🍽️', severity: 'high',
        title: 'Food Safety Alert — Mankhurd Market',
        body: 'Avoid street food in Mankhurd market area. 3 stalls under investigation.',
        issued: '4 hours ago', expires: '48 hours',
    },
    {
        id: 'adv3', type: 'MOSQUITO', icon: '🦟', severity: 'medium',
        title: 'Dengue Prevention — Kurla',
        body: 'Use mosquito repellent. Drain stagnant water. Wear full-sleeve clothing.',
        issued: '6 hours ago', expires: '7 days',
    },
    {
        id: 'adv4', type: 'GENERAL', icon: '😷', severity: 'low',
        title: 'General Health Advisory',
        body: 'Wash hands frequently. Seek medical attention if fever persists > 2 days.',
        issued: '12 hours ago', expires: '7 days',
    },
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

