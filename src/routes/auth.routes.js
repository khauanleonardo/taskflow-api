const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validar = require('../middlewares/validar.middleware');
const schemas = require('../schemas/schemas');

router.post('/login', validar(schemas.login), authController.login);

module.exports = router;
