const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./model');
const userRouter = require('./router/user.router');
const authRouter = require('./router/auth.router');
const apiRouter = require('./router/api.router');
const materielRouter = require('./router/materiel.router'); // Correction du nom pour éviter les doublons dans les routes
const { hashPassword } = require('./util');
const actualiteRouter = require('./router/actualite.router');

require('dotenv').config();
const app = express();

// Ajout de localhost:5173 dans les options CORS
var corsOptions = {
    origin: [
        "http://localhost:3000", 
        "http://192.168.8.100:3000", 
        "http://192.168.8.101:3000", 
        "http://192.168.8.102:3000",
        "http://localhost:5173"  // Ajout de l'origine du front-end (React/Vite)
    ]
};

// Synchronisation de la base de données
db.sequelize.sync()
    .then(() => {
        console.log('Base de données synchronisée.');
    })
    .catch((err) => {
        console.error('Erreur lors de la synchronisation de la base de données :', err);
    });

// Utilisation de CORS avec les options définies
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Désactivation du cache
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
}); 

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Servir les fichiers téléchargés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1', apiRouter);
// app.use('/api/v1/materiels', materielRouter); // Correction de la route pour "materiels"
app.use('/api/v1/actualite', actualiteRouter)
app.use('/api/v1/materiels', materielRouter);


// Route 404 pour les requêtes inconnues
app.all("*", (req, res) => {
    res.status(404).json({ message: `The URL "${req.originalUrl}" does not exist.` });
});

console.log(hashPassword("root123"));

// Utilisation de la variable d'environnement PORT avec une valeur par défaut
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
