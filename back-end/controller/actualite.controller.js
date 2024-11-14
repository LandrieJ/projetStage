const db = require('../model');
const { getPagingData } = require('../util');
const Actualite = db.actualite;
const Op = db.Sequelize.Op;
const fs = require('fs');

// Récupérer toutes les actualités avec pagination et recherche
exports.getActualites = async (req, res) => {
    let { page, limit, q } = req.query;
    
    try {
        page = !page || isNaN(page) || parseInt(page) < 1 ? 1 : parseInt(page);
        limit = !limit || isNaN(limit) || parseInt(limit) < 1 ? 20 : parseInt(limit);
        const offset = (page - 1) * limit;

        const whereClause = q && q.length > 1 ? {
            [Op.or]: [
                { titre: { [Op.like]: `%${q}%` } },
                { contenu: { [Op.like]: `%${q}%` } }
            ]
        } : {};

        const data = await Actualite.findAndCountAll({
            limit,
            offset,
            where: whereClause,
            order: [["createdAt", "DESC"]]
        });

        const actualites = getPagingData(data, page, limit);

        return res.status(200).json(actualites);
    } catch (err) {
        return res.status(422).json({ message: err.message });
    }
};

// Récupérer une actualité par ID
exports.getActualiteById = async (req, res) => {
    try {
        const { id } = req.params;
        const actualite = await Actualite.findByPk(id);

        if (!actualite) {
            return res.status(404).json({ message: "Actualité non trouvée." });
        }

        return res.status(200).json(actualite);
    } catch (err) {
        return res.status(422).json({ message: err.message });
    }
};

// Ajouter une nouvelle actualité
exports.addActualite = async (req, res) => {
    const { titre, contenu } = req.body;
    const imgUrl = req.file ? req.file.filename : null;

    try {
        const actualite = await Actualite.create({ titre, contenu, imgUrl, status: true });
        return res.status(201).json(actualite);
    } catch (err) {
        return res.status(422).json({ message: `Erreur lors de l'ajout de l'actualité : ${err.message}` });
    }
};

// Mettre à jour une actualité
exports.updateActualite = async (req, res) => {
    const { titre, contenu, status } = req.body;

    try {
        const actualite = await Actualite.findByPk(req.params.id);

        if (!actualite) {
            return res.status(404).json({ message: "Actualité non trouvée." });
        }

        const oldImage = actualite.imgUrl;
        actualite.titre = titre || actualite.titre;
        actualite.contenu = contenu || actualite.contenu;
        actualite.imgUrl = req.file ? req.file.filename : actualite.imgUrl;
        actualite.status = typeof status !== 'undefined' ? status : actualite.status;
        
        await actualite.save();

        if (oldImage && req.file) {
            fs.unlinkSync(__dirname + "/../public/uploads/" + oldImage, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log("Ancienne image supprimée");
                }
            });
        }

        return res.status(200).json(actualite);
    } catch (err) {
        return res.status(422).json({ message: `Erreur lors de la mise à jour de l'actualité : ${err.message}` });
    }
};

// Supprimer une actualité
exports.deleteActualite = async (req, res) => {
    try {
        const actualite = await Actualite.findByPk(req.params.id);

        if (!actualite) {
            return res.status(404).json({ message: "Actualité non trouvée." });
        }

        const oldImage = actualite.imgUrl;
        await actualite.destroy();

        if (oldImage) {
            fs.unlinkSync(__dirname + "/../public/uploads/" + oldImage, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log("Image supprimée");
                }
            });
        }

        return res.status(200).json({ message: "Actualité supprimée avec succès." });
    } catch (err) {
        return res.status(422).json({ message: `Erreur lors de la suppression de l'actualité : ${err.message}` });
    }
};
