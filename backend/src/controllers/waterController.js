const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

exports.create = async (req, res, next) => {
    try {
        const { wardId, reportDate, chlorineLevel, phLevel, turbidity, ecoli, totalColiforms, source } = req.body;
        const record = await prisma.waterQualityReport.create({
            data: { wardId, reportDate: new Date(reportDate), chlorineLevel, phLevel, turbidity, ecoli, totalColiforms, source },
        });
        logger.info(`Water report recorded: Ward ${wardId} | Cl=${chlorineLevel} pH=${phLevel} NTU=${turbidity}`);
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
            where.reportDate = {};
            if (from) where.reportDate.gte = new Date(from);
            if (to) where.reportDate.lte = new Date(to);
        }
        const records = await prisma.waterQualityReport.findMany({
            where, orderBy: { reportDate: 'desc' }, take: parseInt(limit),
        });
        res.json(records);
    } catch (err) {
        next(err);
    }
};

exports.latestByWard = async (req, res, next) => {
    try {
        const { wardId } = req.params;
        const record = await prisma.waterQualityReport.findFirst({
            where: { wardId }, orderBy: { reportDate: 'desc' },
        });
        if (!record) return res.status(404).json({ error: 'No water report found for this ward' });
        res.json(record);
    } catch (err) {
        next(err);
    }
};
