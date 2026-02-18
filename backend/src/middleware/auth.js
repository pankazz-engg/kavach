const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Verifies JWT and attaches user payload to req.user
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // { id, email, role, wardId }
        next();
    } catch (err) {
        logger.warn(`Auth failed: ${err.message}`);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

/**
 * Role-based access guard factory
 * Usage: authorize('GOV', 'HOSPITAL')
 */
const authorize = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            error: `Access denied. Required role(s): ${roles.join(', ')}`,
        });
    }
    next();
};

module.exports = { authenticate, authorize };
