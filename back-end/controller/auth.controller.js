const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const db = require('../model');
const { generateString, hashPassword } = require('../util');
const User = db.users;

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    
    try{
        let user = await User.findOne({
            where: {
                email: email
            },
            attributes: ['id', 'password', 'status', 'role']
        });

        if(!user)
            return res.status(422).json({ message: "L'adresse e-mail \"" + email + "\" n'a pas pu être trouvée dans nos fichiers." });

        if(user.status === false)
            return res.status(422).json({ message: "Désolé, votre compte est désactivé." });

        const match = await bcrypt.compare(password, user.password);

        if(!match) return res.status(422).json({message: "Votre mot de passe n'est pas correct. Veuillez réessayer s'il vous plaît."});

        const id = user.id;
        const role = user.role;
        
        const jwt_access = jwt.sign({id, role}, process.env.SECRET, { expiresIn: '1h' });

        return res.status(200).json(jwt_access);
    }catch(err){
        return res.status(422).json({
            message: err.message
        });
    }
}

exports.me = async (req, res, next) => {
    let user = await User.findByPk(req.user.id);
    if(!user)
        return res.status(404).json({
            message: "User not found!"
        });
    return res.status(200).json(user);
}

exports.generatePassword = (req, res, next) => {
    let password = generateString(8);
    return res.status(200).json({
        password: password,
        hashedPassword: hashPassword(password)
    });
}