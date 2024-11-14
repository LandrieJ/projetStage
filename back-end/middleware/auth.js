const jwt = require("jsonwebtoken");

const isAuthenticated = async (req, res, next) => {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];

        try {
            const verify = await jwt.verify(bearerToken, process.env.SECRET);
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

module.exports = isAuthenticated;
