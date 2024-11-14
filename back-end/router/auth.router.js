const express = require('express');
const authRouter = express.Router();
const { login, me, generatePassword } = require('../controller/auth.controller');
const isAuthenticated = require('../middleware/auth');

authRouter.post("/login", login);
authRouter.get("/me", isAuthenticated, me);
authRouter.get("/generate-password", generatePassword);


module.exports = authRouter;