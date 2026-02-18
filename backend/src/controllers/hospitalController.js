const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

// Syndrome → OutbreakCategory mapping (mirrors SyndromeMapping seed)
const SYNDROME_CATEGORY_MAP = {
    DIARRHEA: 'WATERBORNE',
    VOMITING: 'FOODBORNE',
    FEVER: 'VECTOR_BORNE',
    COUGH: 'AIRBORNE',
    RESPIRATORY_DISTRESS: 'AIRBORNE',
    SKIN_RASH: 'VECTOR_BORNE',
    JAUNDICE: 'WATERBORNE',
    HEADACHE: 'VECTOR_BORNE',
    UNKNOWN: 'UNKNOWN',
};

exports.create = async (req, res, next) => {
    try {
        const { wardId, hospitalName, reportDate, syndromeType, admissionCount, severeCount, deathCount, ageGroup } = req.body;
        const outbreakCategory = SYNDROME_CATEGORY_MAP[syndromeType] || 'UNKNOWN';

        const record = await prisma.hospitalAdmission.create({
            data: {
                wardId, hospitalName,
                reportDate: new Date(reportDate),
                syndromeType, outbreakCategory,
                admissionCount, severeCount, deathCount, ageGroup,
            },
        });

        logger.info(`Hospital admission recorded: Ward ${wardId} | ${syndromeType} | ${admissionCount} cases`);
        res.status(201).json(record);
    } catch (err) {
        next(err);
    }
};

exports.list = async (req, res, next) => {
    try {
        const { wardId, syndromeType, from, to, limit = 100 } = req.query;
        const where = {};
        if (wardId) where.wardId = wardId;
        if (syndromeType) where.syndromeType = syndromeType;
        if (from || to) {
            where.reportDate = {};
            if (from) where.reportDate.gte = new Date(from);
            if (to) where.reportDate.lte = new Date(to);
        }

        const records = await prisma.hospitalAdmission.findMany({
            where,
            orderBy: { reportDate: 'desc' },
            take: parseInt(limit),
            include: { ward: { select: { name: true, city: true } } },
        });
        res.json(records);
    } catch (err) {
        next(err);
    }
};

exports.wardSummary = async (req, res, next) => {
    try {
        const { wardId } = req.params;
        const { days = 7 } = req.query;
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        // Aggregate by syndromeType for the ward in the last N days
        const summary = await prisma.hospitalAdmission.groupBy({
            by: ['syndromeType', 'outbreakCategory'],
            where: { wardId, reportDate: { gte: since } },
            _sum: { admissionCount: true, severeCount: true, deathCount: true },
            _count: { id: true },
            orderBy: { _sum: { admissionCount: 'desc' } },
        });

        // Compute 7-day rolling total
        const total = summary.reduce((acc, s) => acc + (s._sum.admissionCount || 0), 0);

        res.json({ wardId, periodDays: parseInt(days), totalAdmissions: total, breakdown: summary });
    } catch (err) {
        next(err);
    }
};
