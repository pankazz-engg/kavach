const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

const signToken = (user) =>
    jwt.sign(
        { id: user.id, email: user.email, role: user.role, wardId: user.wardId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

exports.register = async (req, res, next) => {
    try {
        const { email, password, role, name, wardId } = req.body;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(409).json({ error: 'Email already registered' });

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { email, passwordHash, role, name, wardId },
            select: { id: true, email: true, role: true, name: true, wardId: true, createdAt: true },
        });

        const token = signToken(user);
        logger.info(`New user registered: ${email} [${role}]`);
        res.status(201).json({ token, user });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = signToken(user);
        logger.info(`User logged in: ${email}`);
        res.json({
            token,
            user: { id: user.id, email: user.email, role: user.role, name: user.name, wardId: user.wardId },
        });
    } catch (err) {
        next(err);
    }
};

exports.me = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, role: true, name: true, wardId: true, createdAt: true },
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        next(err);
    }
};
