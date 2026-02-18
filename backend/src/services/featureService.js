const prisma = require('../utils/prisma');

/**
 * Builds the feature vector for a ward to send to the ML service.
 * Computes rolling averages, lag features, spike scores, and cluster density.
 */
exports.buildFeatures = async (wardId) => {
    const now = new Date();
    const days7 = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const days2 = new Date(now - 2 * 24 * 60 * 60 * 1000);
    const days1 = new Date(now - 1 * 24 * 60 * 60 * 1000);

    // ── Hospital Admissions ──────────────────────────────────────────────────
    const admissions7d = await prisma.hospitalAdmission.findMany({
        where: { wardId, reportDate: { gte: days7 } },
        orderBy: { reportDate: 'asc' },
    });

    const totalAdmissions7d = admissions7d.reduce((s, r) => s + r.admissionCount, 0);
    const admissions48h = admissions7d.filter((r) => r.reportDate >= days2);
    const totalAdmissions48h = admissions48h.reduce((s, r) => s + r.admissionCount, 0);

    // Syndrome spike score: 48h count / 7d daily avg
    const dailyAvg7d = totalAdmissions7d / 7;
    const syndromeSpike48h = dailyAvg7d > 0 ? (totalAdmissions48h / 2) / dailyAvg7d : 0;

    // Syndrome breakdown (counts per type in last 48h)
    const syndromeBreakdown = admissions48h.reduce((acc, r) => {
        acc[r.syndromeType] = (acc[r.syndromeType] || 0) + r.admissionCount;
        return acc;
    }, {});

    // ── Water Quality ────────────────────────────────────────────────────────
    const waterReports7d = await prisma.waterQualityReport.findMany({
        where: { wardId, reportDate: { gte: days7 } },
        orderBy: { reportDate: 'asc' },
    });

    const avgChlorine7d = mean(waterReports7d.map((r) => r.chlorineLevel));
    const latestWater = waterReports7d[waterReports7d.length - 1];
    const currentChlorine = latestWater?.chlorineLevel ?? avgChlorine7d;
    // Chlorine drop ratio: how much it dropped vs 7d avg
    const chlorineDropRatio = avgChlorine7d > 0
        ? Math.max(0, (avgChlorine7d - currentChlorine) / avgChlorine7d)
        : 0;

    const avgTurbidity7d = mean(waterReports7d.map((r) => r.turbidity));
    const currentTurbidity = latestWater?.turbidity ?? avgTurbidity7d;
    const avgPh7d = mean(waterReports7d.map((r) => r.phLevel));
    const currentPh = latestWater?.phLevel ?? avgPh7d;

    // ── Weather ──────────────────────────────────────────────────────────────
    const weatherData7d = await prisma.weatherData.findMany({
        where: { wardId, recordedAt: { gte: days7 } },
        orderBy: { recordedAt: 'asc' },
    });

    const rainfallValues = weatherData7d.map((r) => r.rainfall);
    const avgRainfall7d = mean(rainfallValues);
    const p90Rainfall = percentile(rainfallValues, 90);

    // Lag rainfall: yesterday's total rainfall
    const yesterdayWeather = weatherData7d.filter((r) => r.recordedAt >= days1);
    const lagRainfall1d = yesterdayWeather.reduce((s, r) => s + r.rainfall, 0);
    const rainfallSpike = lagRainfall1d > p90Rainfall;

    const avgTemp7d = mean(weatherData7d.map((r) => r.temperature));
    const avgHumidity7d = mean(weatherData7d.map((r) => r.humidity));

    // ── Citizen Reports ──────────────────────────────────────────────────────
    const citizenReports24h = await prisma.citizenReport.findMany({
        where: { wardId, reportedAt: { gte: days1 } },
        select: { syndromeType: true, severity: true, latitude: true, longitude: true },
    });

    const citizenClusterCount = citizenReports24h.length;
    // Weighted severity score
    const citizenSeverityScore = citizenReports24h.reduce((s, r) => s + r.severity, 0) / Math.max(1, citizenClusterCount);

    // ── Assemble Feature Vector ──────────────────────────────────────────────
    return {
        // Admission features
        totalAdmissions7d,
        totalAdmissions48h,
        dailyAvg7d,
        syndromeSpike48h,           // Key spike multiplier
        syndromeBreakdown,

        // Water features
        avgChlorine7d,
        currentChlorine,
        chlorineDropRatio,           // Key: 0–1 (1 = fully dropped)
        avgTurbidity7d,
        currentTurbidity,
        avgPh7d,
        currentPh,
        phDeviation: Math.abs(currentPh - 7.0),

        // Weather features
        avgRainfall7d,
        lagRainfall1d,               // Key lag feature
        rainfallSpike,               // Boolean
        p90Rainfall,
        avgTemp7d,
        avgHumidity7d,

        // Citizen features
        citizenClusterCount,         // Key density metric
        citizenSeverityScore,

        // Metadata
        wardId,
        computedAt: now.toISOString(),
    };
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function mean(arr) {
    if (!arr.length) return 0;
    return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function percentile(arr, p) {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
}
