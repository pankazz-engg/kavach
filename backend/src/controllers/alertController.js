const prisma = require('../utils/prisma');
const alertService = require('../services/alertService');
const logger = require('../utils/logger');

exports.create = async (req, res, next) => {
    try {
        const { wardId, severity, outbreakCategory, message, recommendedAction, recipientType } = req.body;
        const alert = await prisma.alert.create({
            data: { wardId, severity, outbreakCategory, message, recommendedAction, recipientType },
        });

        // Dispatch immediately
        await alertService.dispatch(alert);
        logger.info(`Alert created: Ward ${wardId} | ${severity} | ${outbreakCategory}`);
        res.status(201).json(alert);
    } catch (err) {
        next(err);
    }
};

exports.list = async (req, res, next) => {
    try {
        const { wardId, severity, status, limit = 50 } = req.query;
        const where = {};
        if (wardId) where.wardId = wardId;
        if (severity) where.severity = severity;
        if (status) where.status = status;

        const alerts = await prisma.alert.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
            include: { ward: { select: { name: true, city: true } } },
        });
        res.json(alerts);
    } catch (err) {
        next(err);
    }
};

exports.byWard = async (req, res, next) => {
    try {
        const { wardId } = req.params;
        const alerts = await prisma.alert.findMany({
            where: { wardId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        res.json(alerts);
    } catch (err) {
        next(err);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const alert = await prisma.alert.update({
            where: { id },
            data: { status, sentAt: status === 'SENT' ? new Date() : undefined },
        });
        res.json(alert);
    } catch (err) {
        next(err);
    }
};
