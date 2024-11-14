// const bcrypt = require('bcryptjs');
const db = require('../model');
const { hashPassword, getPagingData } = require('../util');
const User = db.users;
const Op = db.Sequelize.Op;

exports.getUsers = async (req, res, next) => {
    let { page, limit, q } = req.query;
    try{
		if(!page || isNaN(page) || parseInt(page) < 1) page = 1; else page = parseInt(page);
		if(!limit || isNaN(limit) || parseInt(limit) < 1) limit = 20; else limit = parseInt(limit);

		let offset = (parseInt(page) - 1) * limit;

		const data = (q && q.length > 1) ? 
		await User.findAndCountAll({
			limit,
			offset,
			where:{
				[Op.or]: [
					{prenom: {[Op.like]: `%${ q }%`}},
					{nom: {[Op.like]: `%${ q }%`}},
					{email: {[Op.like]: `%${ q }%`}}
				]
			},
			order: [
				["createdAt", "DESC"]
			],
            attributes: {exclude: ['password', 'token', 'tokenExpiredAt']}
		})
		:
		await User.findAndCountAll({
			limit,
			offset,
			order: [
				["createdAt", "DESC"]
			],
            attributes: {exclude: ['password', 'token', 'tokenExpiredAt']}
		});

		let users = getPagingData(data, page, limit);

		return res.status(200).json(users);
    }catch(err){
        return res.status(422).json({ message: err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message });
    }
}

exports.getUser = async(req, res, next) => {
    try{
		const { id } = req.params;
		let user = await User.findByPk(id, {
	       attributes: {exclude: ['password', 'token', 'tokenExpiredAt']}
		});
		if(!user)
			return res.status(404).json({
				message: "Désolé, cet utilisateur n'existe pas dans nos fichiers."
			});
		return res.status(200).json(user)
	}catch(err){
		return res.status(422).json({ message: err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message });
	}
}

exports.addUser = async (req, res, next) => {
    let {nom, prenom, password, email, role, } = req.body;
    let errors = {};

	if(!prenom)
        errors['lastname'] = "Veuillez saisir votre nom.";
	
	if(prenom.length > 0 && prenom.length < 2)
        errors['lastname'] = "Le nom n'est pas valide.";
	
	if(!nom)
        errors['firstname'] = "Veuillez saisir votre prénom.";
    
    if(nom.length > 0 && nom.length < 2)
        errors['firstname'] = "Le prénom n'est pas valide.";

    if(!password || password.length < 4)
        errors['password'] = "Un mot de passe doit avoir au moins 4 caractères.";

    if(!email)
        errors["email"] = "Veuillez saisir votre e-mail.";
    
    if(email.length > 1 && /^[a-z0-9.-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email) === false)
        errors["email"] = "Votre mail n'est pas valide.";
    
    if(!role)
        errors["role"] = "Veuillez saisir votre role.";
    
    if(role && role.length > 0 && role.length < 2)
        errors["role"] = "Votre role n'est pas valide.";

    if(Object.keys(errors).length > 0)
        return res.status(422).json({ errors });
	
	try{
		// console.log(birthdate)
		let user = await User.findOne({
			where: {
				email
			}
		});
	
		if(user)
			return res.status(422).json({
				errors: {
					email: "Désolé, cet e-mail est déjà utilisé par un autre compte."
				}
			});
	
			
			user = await User.create({prenom:prenom, nom: nom,  email: email, role: role, password: hashPassword(password), status: true });
			return res.status(200).json(user);
		}catch(err){
			return res.status(422).json({
				errors: {
					global: "Désolé, l'utilisateur \"" + prenom + " " + nom + "\" n'a pas pu être enregistré."
				}
			});
		}
	}
	
exports.updateUser = async (req, res, next) => {
	let { prenom, nom, email,  password, status, role} = req.body;
	let errors = {};

	if(!prenom)
        errors['lastname'] = "Veuillez saisir votre nom.";
	
	if(prenom.length > 0 && prenom.length < 2)
        errors['lastname'] = "Le nom n'est pas valide.";
	
	if(!nom)
        errors['firstname'] = "Veuillez saisir votre prénom.";
    
    if(nom.length > 0 && nom.length < 2)
        errors['firstname'] = "Le prénom n'est pas valide.";

    if(password && password.length < 8)
	errors['password'] = "Un mot de passe doit avoir au moins 8 caractères.";

if(!email)
errors["email"] = "Veuillez saisir votre e-mail.";

if(email.length > 1 && /^[a-z0-9.-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email) === false)
        errors["email"] = "Votre mail n'est pas valide.";
	
    if(!role)
        errors["role"] = "Veuillez saisir votre role.";
	
	if(role && role.length > 0 && role.length < 2)
        errors["role"] = "Votre role n'est pas valide.";
	
    if(Object.keys(errors).length > 0)
        return res.status(422).json({ errors });
	
	try{
		let user = await User.findOne({
			where: {
				email,
				id: {[Op.ne]: req.params.id}
			}
		});
		// return res.status(404).json({message: "OK"});
		
		if(user)
			return res.status(422).json({
				errors: {
					email: "Désolé, cet e-mail est déjà utilisé par un autre compte."
				}
			});
		
        if(password && password.length >= 8)
            await User.update({  prenom: prenom, nom: nom, email: email, password: hashPassword(password), role: role }, {
                where: {id: req.params.id}
            });
        else
            await User.update({  prenom: prenom, nom: nom, email: email,  role: role }, {
                where: {id: req.params.id}
            });
		
		user = await User.findByPk(req.params.id, {
			attributes: {exclude: ['password', 'token', 'tokenExpiredAt']}
		});
		return res.status(200).json(user);
	}catch(err){
		return res.status(422).json({
			errors: {
				global: "Désolé, l'utilisateur \"" + lastname + " " + firstname + "\" n'a pas pu être enregistré."
			}
		});
	}
}

exports.deleteUser = async (req, res, next) => {
    try {
		let user = await User.findByPk(req.params.id);
		if(!user)
			return res.status(404).json({
				message: "User #" + req.params.id + " not found."
			});
		
		await user.destroy();

		return res.status(200).json({
			message: "L'utilisateur #" + req.params.id + " a été supprimé."
		});
	}catch(err){
		return res.status(422).json({
			global: "Désolé, il y a une erreur."
		});
	}
 
}