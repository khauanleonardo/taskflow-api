// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validar = require('../middlewares/validar');
const schemas = require('../middlewares/schemas');

router.post('/login', validar(schemas.login), authController.login);

module.exports = router;
