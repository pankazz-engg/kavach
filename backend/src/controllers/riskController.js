const prisma = require('../utils/prisma');
const mlService = require('../services/mlService');
const alertService = require('../services/alertService');
const featureService = require('../services/featureService');
const logger = require('../utils/logger');

/**
 * POST /api/risk/predict
 * Orchestrates: feature engineering → ML call → store prediction → auto-alert if threshold exceeded
 */
exports.predict = async (req, res, next) => {
    try {
        const { wardId, forecastHorizon = 48 } = req.body;

        // 1. Verify ward exists
        const ward = await prisma.ward.findUnique({ where: { id: wardId } });
        if (!ward) return res.status(404).json({ error: 'Ward not found' });

        // 2. Engineer features from last 7 days of data
        const features = await featureService.buildFeatures(wardId);

        // 3. Call Python ML microservice
        const mlResult = await mlService.predict({ wardId, features, forecastHorizon });
        // mlResult: { riskScore, outbreakCategory, confidence, isAnomaly, shapReasons, outbreakReasons }

        // 4. Store prediction
        const prediction = await prisma.riskPrediction.create({
            data: {
                wardId,
                forecastHorizon,
                riskScore: mlResult.riskScore,
                outbreakCategory: mlResult.outbreakCategory,
                confidence: mlResult.confidence,
                isAnomaly: mlResult.isAnomaly,
                shapReasons: JSON.stringify(mlResult.shapReasons || []),
                outbreakReasons: JSON.stringify(mlResult.outbreakReasons || []),
                rawFeatures: JSON.stringify(features),
            },
        });

        // 5. Auto-trigger alert if risk exceeds threshold
        const threshold = parseFloat(process.env.RISK_ALERT_THRESHOLD || '0.7');
        if (mlResult.riskScore >= threshold) {
            await alertService.triggerAutoAlert(prediction, ward);
        }

        logger.info(`Risk prediction: Ward ${wardId} | score=${mlResult.riskScore} | ${mlResult.outbreakCategory}`);
        res.json({
            ...prediction,
            shapReasons: JSON.parse(prediction.shapReasons || '[]'),
            outbreakReasons: JSON.parse(prediction.outbreakReasons || '[]'),
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/risk/heatmap
 * Returns latest risk score per ward for Mapbox heatmap
 */
exports.heatmap = async (req, res, next) => {
    try {
        const wards = await prisma.ward.findMany({
            include: {
                riskPredictions: {
                    orderBy: { predictedAt: 'desc' },
                    take: 1,
                    select: { riskScore: true, outbreakCategory: true, confidence: true, predictedAt: true },
                },
            },
        });

        const heatmapData = wards.map((w) => ({
            wardId: w.id,
            name: w.name,
            city: w.city,
            latitude: w.latitude,
            longitude: w.longitude,
            riskScore: w.riskPredictions[0]?.riskScore ?? null,
            outbreakCategory: w.riskPredictions[0]?.outbreakCategory ?? null,
            confidence: w.riskPredictions[0]?.confidence ?? null,
            lastPredicted: w.riskPredictions[0]?.predictedAt ?? null,
        }));

        res.json(heatmapData);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/risk
 * Paginated list of all predictions
 */
exports.list = async (req, res, next) => {
    try {
        const { wardId, limit = 50, offset = 0 } = req.query;
        const where = wardId ? { wardId } : {};
        const predictions = await prisma.riskPrediction.findMany({
            where,
            orderBy: { predictedAt: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset),
            include: { ward: { select: { name: true, city: true } } },
        });
        res.json(predictions);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/risk/:wardId
 * Latest prediction for a specific ward (with full insight box)
 */
exports.latestByWard = async (req, res, next) => {
    try {
        const { wardId } = req.params;
        const prediction = await prisma.riskPrediction.findFirst({
            where: { wardId },
            orderBy: { predictedAt: 'desc' },
            include: { ward: { select: { name: true, city: true, latitude: true, longitude: true } } },
        });
        if (!prediction) return res.status(404).json({ error: 'No prediction found for this ward' });
        res.json({
            ...prediction,
            shapReasons: JSON.parse(prediction.shapReasons || '[]'),
            outbreakReasons: JSON.parse(prediction.outbreakReasons || '[]'),
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/risk/my-ward
 * Latest prediction for the authenticated user's ward (mobile app)
 */
exports.myWard = async (req, res, next) => {
    try {
        const wardId = req.user?.wardId;
        if (!wardId) return res.status(400).json({ error: 'No ward assigned to your account' });

        const prediction = await prisma.riskPrediction.findFirst({
            where: { wardId },
            orderBy: { predictedAt: 'desc' },
            include: { ward: { select: { name: true, city: true, latitude: true, longitude: true } } },
        });
        if (!prediction) return res.status(404).json({ error: 'No prediction found for your ward' });

        res.json({
            ...prediction,
            shapReasons: JSON.parse(prediction.shapReasons || '[]'),
            outbreakReasons: JSON.parse(prediction.outbreakReasons || '[]'),
        });
    } catch (err) {
        next(err);
    }
};
