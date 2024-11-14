const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration du stockage pour multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'public/uploads'; // Chemin où les fichiers seront stockés

        // Vérifiez si le répertoire existe, sinon créez-le
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // Crée le dossier de manière récursive
        }

        cb(null, uploadPath); // Utilise le chemin après vérification/création
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Filtrage pour accepter uniquement les images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Seuls les fichiers images (jpeg, jpg, png) sont autorisés.'), false);
    }
};

// Limitation de la taille du fichier (exemple : 5 Mo)
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limite de 5 Mo
    fileFilter: fileFilter
});

module.exports = upload;
