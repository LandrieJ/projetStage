const express = require('express');
const isAuthenticated = require('../middleware/auth');
const {
    changeEmail,
    changePassword,  // Assurez-vous que cela correspond à l'export
    resetPassword
} = require('../controller/api.controller');
const { generatePassword } = require('../controller/auth.controller');
const apiRouter = express.Router();
// Définition des routes API
apiRouter.post("/change-email", isAuthenticated, changeEmail);
apiRouter.post("/change-password", isAuthenticated, changePassword); // Utilisez changePassword ici
apiRouter.get("/generate-password", generatePassword);
apiRouter.post("/resetPassword",  resetPassword); // Correction de la casse

module.exports = apiRouter;
