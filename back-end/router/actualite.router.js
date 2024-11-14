const express = require('express');
const actualiteRouter = express.Router();
const upload = require('../middleware/uploads');
const isAuthenticated = require('../middleware/auth');
const {
    getActualites, 
    getActualiteById, 
    addActualite, 
    updateActualite, 
    deleteActualite 
} = require('../controller/actualite.controller');
// Routes
actualiteRouter.get("/", isAuthenticated, getActualites); // Récupérer toutes les actualités
actualiteRouter.get("/:id", isAuthenticated, getActualiteById); // Récupérer une actualité par ID
actualiteRouter.post("/", isAuthenticated, upload.single('image'), addActualite); // Ajouter une actualité
actualiteRouter.put("/:id", isAuthenticated, upload.single('image'), updateActualite); // Mettre à jour une actualité
actualiteRouter.delete("/:id", isAuthenticated, deleteActualite); // Supprimer une actualité

module.exports = actualiteRouter;
