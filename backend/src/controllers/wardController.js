const prisma = require('../utils/prisma');

exports.create = async (req, res, next) => {
    try {
        const ward = await prisma.ward.create({ data: req.body });
        res.status(201).json(ward);
    } catch (err) {
        next(err);
    }
};

exports.list = async (req, res, next) => {
    try {
        const wards = await prisma.ward.findMany({ orderBy: { name: 'asc' } });
        res.json(wards);
    } catch (err) {
        next(err);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const ward = await prisma.ward.findUnique({ where: { id: req.params.id } });
        if (!ward) return res.status(404).json({ error: 'Ward not found' });
        res.json(ward);
    } catch (err) {
        next(err);
    }
};
