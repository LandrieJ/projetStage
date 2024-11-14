const jwt = require("jsonwebtoken");

const isAdmin = async (req, res, next) => {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
		console.log(bearer)

        try {
			const verify = await jwt.verify(bearerToken, process.env.SECRET);

            // Vérifiez le rôle de l'utilisateur
            console.log("Rôle utilisateur :", verify.role);
            if (verify.role !== 'admin') {
                return res.status(403).json({ message: 'Accès refusé : rôle non autorisé.' });
            }

            req.user = { id: verify.id, role: verify.role };
            next();
        } catch (err) {
            console.error("Erreur de vérification du token :", err);
            return res.status(401).json({ message: 'Token non valide ou expiré.' });
        }
    } else {
        return res.status(401).json({ message: 'Authorization manquante.' });
    }
}

module.exports = isAdmin;
