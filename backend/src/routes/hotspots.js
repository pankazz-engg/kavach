/**
 * Backend hotspot route — proxies to ML service DBSCAN clustering
 * GET /api/hotspots
 */
const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const axios = require('axios');
const logger = require('../utils/logger');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * GET /api/hotspots
 * Fetches latest heatmap data, sends to ML /hotspots for DBSCAN clustering,
 * returns GeoJSON FeatureCollection for Mapbox.
 */
router.get('/', async (req, res, next) => {
    try {
        // Get latest risk score per ward
        const wards = await prisma.ward.findMany({
            include: {
                riskPredictions: {
                    orderBy: { predictedAt: 'desc' },
                    take: 1,
                    select: { riskScore: true, outbreakCategory: true },
                },
            },
        });

        const wardData = wards
            .filter(w => w.latitude && w.longitude)
            .map(w => ({
                wardId: w.id,
                name: w.name,
                latitude: w.latitude,
                longitude: w.longitude,
                riskScore: w.riskPredictions[0]?.riskScore ?? 0,
                outbreakCategory: w.riskPredictions[0]?.outbreakCategory ?? null,
            }));

        // Call ML service for DBSCAN clustering
        try {
            const response = await axios.post(`${ML_URL}/hotspots`, wardData, { timeout: 10000 });
            return res.json(response.data);
        } catch (mlErr) {
            logger.warn('ML hotspot service unavailable, using fallback');
            // Fallback: return high-risk wards as individual hotspots
            const highRisk = wardData.filter(w => w.riskScore >= 0.6);
            const geoJson = {
                type: 'FeatureCollection',
                features: highRisk.map((w, i) => ({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [w.longitude, w.latitude] },
                    properties: {
                        clusterId: i,
                        wardCount: 1,
                        maxRiskScore: w.riskScore,
                        wardNames: [w.name],
                        radius: 600,
                        severity: w.riskScore >= 0.8 ? 'CRITICAL' : 'HIGH',
                    },
                })),
                clusterCount: highRisk.length,
            };
            return res.json(geoJson);
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;
