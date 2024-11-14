module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        nom: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        prenom: {
            type: Sequelize.STRING(100),
            allowNull: false
        },

        email: {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true
        },
        password: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        role: {
            type: Sequelize.STRING(10),
            allowNull: false,
            default: "user"
        },
        status: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            default: false
        },
        token: {
            type: Sequelize.STRING(60),
            allowNull: true,
            default: null
        },
        tokenExpiredAt: {
            type: Sequelize.DATE,
            allowNull: true,
            default: null
        }
    });

    return User;
};