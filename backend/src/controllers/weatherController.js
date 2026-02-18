const prisma = require('../utils/prisma');

exports.create = async (req, res, next) => {
    try {
        const { wardId, recordedAt, rainfall, temperature, humidity, windSpeed, uvIndex } = req.body;
        const record = await prisma.weatherData.create({
            data: { wardId, recordedAt: new Date(recordedAt), rainfall, temperature, humidity, windSpeed, uvIndex },
        });
        res.status(201).json(record);
    } catch (err) {
        next(err);
    }
};

exports.list = async (req, res, next) => {
    try {
        const { wardId, from, to, limit = 100 } = req.query;
        const where = {};
        if (wardId) where.wardId = wardId;
        if (from || to) {
            where.recordedAt = {};
            if (from) where.recordedAt.gte = new Date(from);
            if (to) where.recordedAt.lte = new Date(to);
        }
        const records = await prisma.weatherData.findMany({
            where, orderBy: { recordedAt: 'desc' }, take: parseInt(limit),
        });
        res.json(records);
    } catch (err) {
        next(err);
    }
};

exports.latestByWard = async (req, res, next) => {
    try {
        const { wardId } = req.params;
        const record = await prisma.weatherData.findFirst({
            where: { wardId }, orderBy: { recordedAt: 'desc' },
        });
        if (!record) return res.status(404).json({ error: 'No weather data found for this ward' });
        res.json(record);
    } catch (err) {
        next(err);
    }
};
