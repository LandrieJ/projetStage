const bcrypt = require('bcryptjs');
const db = require('../model');
const { hashPassword } = require('../util');
const User = db.users;
const Op = db.Sequelize.Op;

exports.changeEmail = async (req, res, next) => {
    const { email, password } = req.body;
    let errors = {};
    try {
        if (password && password.length < 8)
            errors['currentPassword'] = "Votre mot de passe n'est pas valide.";

        if (!email)
            errors["email"] = "Veuillez saisir votre e-mail.";

        if (email.length > 1 && /^[a-z0-9.-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email) === false)
            errors["email"] = "Votre e-mail n'est pas valide.";

        if (Object.keys(errors).length > 0)
            return res.status(422).json({ errors });

        let user = await User.findOne({
            where: {
                email,
                id: { [Op.ne]: req.user.id }
            }
        });

        if (user)
            return res.status(422).json({
                errors: {
                    email: "Désolé, cet e-mail est déjà utilisé par un autre compte."
                }
            });

        user = await User.findByPk(req.user.id, {
            attributes: ['password']
        });

        const match = await bcrypt.compare(password, user.password);

        if (!match)
            errors["currentPassword"] = "Votre mot de passe n'est pas correct. Veuillez réessayer s'il vous plaît.";

        if (Object.keys(errors).length > 0)
            return res.status(422).json({ errors });

        await User.update({ email: email }, {
            where: { id: req.user.id }
        });

        user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'token', 'tokenExpiredAt'] }
        });

        return res.status(200).json(user);
    } catch (error) {
        return res.status(422).json({
            errors: {
                global: "Désolé, l'e-mail n'a pas pu enregistrer. Veuillez essayer plus tard."
            }
        });
    }
}

exports.changePassword = async (req, res, next) => {
    const { password, newpassword } = req.body; // Utilisez newpassword comme variable
    let errors = {};

    try {
        if (!password)
            errors['currentPassword'] = "Veuillez saisir votre mot de passe actuel.";

        if (password && password.length < 8)
            errors['currentPassword'] = "Votre mot de passe n'est pas valide.";

        if (Object.keys(errors).length > 0)
            return res.status(422).json({ errors });

        if (!newpassword)
            errors['newpassword'] = "Veuillez saisir votre nouveau mot de passe.";

        if (newpassword && newpassword.length < 8)
            errors['newpassword'] = "Un mot de passe doit avoir au moins 8 caractères.";

        if (Object.keys(errors).length > 0)
            return res.status(422).json({ errors });

        let user = await User.findByPk(req.user.id, {
            attributes: ['password']
        });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            errors["currentPassword"] = "Votre mot de passe n'est pas correct. Veuillez réessayer s'il vous plaît.";

        if (Object.keys(errors).length > 0)
            return res.status(422).json({ errors });

        await User.update({ password: hashPassword(newpassword) }, {
            where: { id: req.user.id }
        });

        user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'token', 'tokenExpiredAt'] }
        });

        return res.status(200).json(user); // Assurez-vous de retourner une réponse
    } catch (error) {
        return res.status(422).json({
            errors: {
                global: "Désolé, le mot de passe n'a pas pu être changé. Veuillez essayer plus tard."
            }
        });
    }
}

exports.resetPassword = async (req, res, next) => {
    const { email, newPassword, confirmPassword } = req.body;
    let errors = {};

    try {
        // Validation des champs
        if (!email) {
            errors['email'] = "Veuillez saisir votre e-mail.";
        } else if (!/^[a-z0-9.-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
            errors['email'] = "Votre e-mail n'est pas valide.";
        }

        if (!newPassword) {
            errors['newPassword'] = "Veuillez saisir un nouveau mot de passe.";
        } else if (newPassword.length < 4) {
            errors['newPassword'] = "Un mot de passe doit avoir au moins 8 caractères.";
        }

        if (newPassword !== confirmPassword) {
            errors['confirmPassword'] = "Les mots de passe ne correspondent pas.";
        }

        if (Object.keys(errors).length > 0) {
            return res.status(422).json({ errors });
        }

        // Vérifier si l'utilisateur existe
        let user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ errors: { email: "Aucun compte trouvé avec cet e-mail." } });
        }

        // Mettre à jour le mot de passe
        await User.update({ password: hashPassword(newPassword) }, { where: { id: user.id } });

        return res.status(200).json({ message: "Votre mot de passe a été réinitialisé avec succès !" });

    } catch (error) {
        return res.status(500).json({
            errors: {
                global: "Désolé, le mot de passe n'a pas pu être réinitialisé. Veuillez essayer plus tard."
            }
        });
    }
};
