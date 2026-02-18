const express = require('express');
const router = express.Router();
const { validate, registerSchema, loginSchema } = require('../validation/schemas');
const authController = require('../controllers/authController');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', require('../middleware/auth').authenticate, authController.me);

module.exports = router;
