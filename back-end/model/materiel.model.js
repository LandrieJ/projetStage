module.exports = (sequelize, DataTypes) => {
    const Materiel = sequelize.define("Materiel", {
        nom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
        },
        url: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });

    return Materiel;
};