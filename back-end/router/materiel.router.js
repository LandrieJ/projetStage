const express = require('express');
const materielRouter = express.Router();
const { getMateriels, getMateriel, updateMateriel, addMateriel, deleteMateriel, getTotalMateriel } = require('../controller/materiel.controller');
const upload = require('../middleware/uploads');
const isAuthenticated = require('../middleware/auth');

// Routes
materielRouter.get("/", isAuthenticated, getMateriels);
materielRouter.get("/:id?", isAuthenticated, getMateriel);
materielRouter.post("/", isAuthenticated, upload.single('image'), addMateriel); // Correction de la méthode pour ajout
materielRouter.put("/:id", isAuthenticated, upload.single('image'), updateMateriel);
materielRouter.delete("/:id?", isAuthenticated, deleteMateriel);
materielRouter.get("/total", isAuthenticated, getTotalMateriel); // Correction de la route pour total

module.exports = materielRouter;
