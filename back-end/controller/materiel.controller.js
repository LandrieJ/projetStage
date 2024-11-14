const db = require('../model');
const { getPagingData } = require('../util');
const Materiel = db.materiel;
const Op = db.Sequelize.Op;
const fs = require('fs');
exports.getMateriels = async (req, res, next) => {
    let { page, limit, q } = req.query;
    try {
        if (!page || isNaN(page) || parseInt(page) < 1) page = 1;
        else page = parseInt(page);
        
        if (!limit || isNaN(limit) || parseInt(limit) < 1) limit = 20;
        else limit = parseInt(limit);

        let offset = (page - 1) * limit;

        const data = (q && q.length > 1) ? 
            await Materiel.findAndCountAll({
                limit,
                offset,
                where: {
                    [Op.or]: [
                        { nom: { [Op.like]: `%${q}%` } },
                        { image: { [Op.like]: `%${q}%` } },
                        { url: { [Op.like]: `%${q}%` } }
                    ]
                },
                order: [["createdAt", "DESC"]],
                attributes: { exclude: ['token', 'tokenExpiredAt'] }
            })
            :
            await Materiel.findAndCountAll({
                limit,
                offset,
                order: [["createdAt", "DESC"]],
                attributes: { exclude: ['token', 'tokenExpiredAt'] }
            });

        let materiels = getPagingData(data, page, limit);

        return res.status(200).json(materiels);
    } catch (err) {
        return res.status(422).json({ message: err.message });
    }
};

exports.getMateriel = async (req, res, next) => {
    try {
        const { id } = req.params;
        let materiel = await Materiel.findByPk(id, {
            attributes: { exclude: ['token', 'tokenExpiredAt'] }
        });

        if (!materiel) {
            return res.status(404).json({ message: "Désolé, ce matériel n'existe pas." });
        }

        return res.status(200).json(materiel);
    } catch (err) {
        return res.status(422).json({ message: err.message });
    }
};

exports.addMateriel = async (req, res, next) => {
    const { nom, url } = req.body;
    const image = req.file ? req.file.filename : null; // Assurez-vous que `req.file` existe

    try {
        // Vérifiez si un matériel avec la même URL existe déjà
        const existingMateriel = await Materiel.findOne({ where: { url } });

        if (existingMateriel) {
            return res.status(422).json({ errors: { url: "Cette URL est déjà utilisée." } });
        }

        // Créez un nouveau matériel
        const materiel = await Materiel.create({ nom, image, url, status: true });
        return res.status(201).json(materiel);
    } catch (err) {
        console.error('Erreur:', err);
        return res.status(422).json({ message: `Le matériel "${nom}" n'a pas pu être enregistré.` });
    }
};



exports.updateMateriel = async (req, res, next) => {
    let { nom, url, status } = req.body;
    try {
        let materiel = await Materiel.findByPk(req.params.id);

        if (!materiel) {
            return res.status(404).json({ message: "Le matériel n'existe pas." });
        }
        const oldImage = materiel.image;
        materiel.nom = nom || materiel.nom;
        materiel.image = req.file ? req.file.filename : materiel.image;
        materiel.url = url || materiel.url;
        materiel.status = typeof status !== 'undefined' ? status : materiel.status;
        await materiel.save();
        // Fonction utilitaire pour supprimer un fichier
        if(oldImage){
            fs.unlinkSync(__dirname + "\\..\\public\\uploads\\" + oldImage, err => {
                if(err)
                    console.log(err)
                else
                    console.log("Old image deleted")
            });
        } 
        return res.status(200).json(materiel);
    } catch (err) {
        return res.status(422).json({ message: err.message });
    }
};

exports.deleteMateriel = async (req, res, next) => {
    try {
        let materiel = await Materiel.findByPk(req.params.id);

        if (!materiel) {
            return res.status(404).json({ message: `Matériel #${req.params.id} introuvable.` });
        }

        await materiel.destroy();
        return res.status(200).json({ message: `Le matériel #${req.params.id} a été supprimé.` });
    } catch (err) {
        return res.status(422).json({ message: "Erreur lors de la suppression du matériel." });
    }
};

exports.getTotalMateriel = async (req, res, next) => {
    try {
        const totalMateriel = await Materiel.count();
        return res.status(200).json({ total: totalMateriel });
    } catch (err) {
        return res.status(422).json({ message: err.message });
    }
};

exports.getTotalUser = async (req, res, next) => {
    try {
        const totalUser = await User.count();
        return res.status(200).json({ total: totalUser });
    } catch (err) {
        return res.status(422).json({ message: err.message });
    }
};

