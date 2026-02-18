const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

exports.create = async (req, res, next) => {
    try {
        const { wardId, latitude, longitude, syndromeType, description, severity } = req.body;
        const report = await prisma.citizenReport.create({
            data: {
                userId: req.user.id,
                wardId, latitude, longitude,
                syndromeType, description, severity,
            },
        });
        logger.info(`Citizen report: Ward ${wardId} | ${syndromeType} | severity ${severity}`);
        res.status(201).json(report);
    } catch (err) {
        next(err);
    }
};

exports.list = async (req, res, next) => {
    try {
        const { wardId, syndromeType, from, limit = 200 } = req.query;
        const where = {};
        if (wardId) where.wardId = wardId;
        if (syndromeType) where.syndromeType = syndromeType;
        if (from) where.reportedAt = { gte: new Date(from) };

        const reports = await prisma.citizenReport.findMany({
            where, orderBy: { reportedAt: 'desc' }, take: parseInt(limit),
            select: {
                id: true, wardId: true, latitude: true, longitude: true,
                syndromeType: true, severity: true, reportedAt: true, isVerified: true,
            },
        });
        res.json(reports);
    } catch (err) {
        next(err);
    }
};

/**
 * Returns geo-cluster density for a ward in the last 24h
 * Used by ML feature engineering
 */
exports.clusterByWard = async (req, res, next) => {
    try {
        const { wardId } = req.params;
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const reports = await prisma.citizenReport.findMany({
            where: { wardId, reportedAt: { gte: since } },
            select: { latitude: true, longitude: true, syndromeType: true, severity: true },
        });

        // Group by syndrome
        const byType = reports.reduce((acc, r) => {
            acc[r.syndromeType] = (acc[r.syndromeType] || 0) + 1;
            return acc;
        }, {});

        res.json({
            wardId,
            totalReports: reports.length,
            since: since.toISOString(),
            byType,
            points: reports, // lat/lng for heatmap
        });
    } catch (err) {
        next(err);
    }
};
