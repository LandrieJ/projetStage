module.exports = (sequelize, DataTypes) => {
    const Actualite = sequelize.define("Actualite", {
      titre: {
        type: DataTypes.STRING,
        allowNull: false, // Le titre est obligatoire
        validate: {
          notEmpty: true, // Assure que le titre n'est pas une chaîne vide
        },
      },
      contenu: {
        type: DataTypes.TEXT,
        allowNull: false, // Le contenu est obligatoire
        validate: {
          notEmpty: true, // Assure que le contenu n'est pas vide
        },
      },
      imgUrl: {
        type: DataTypes.STRING,
        allowNull: true, // L'URL de l'image peut être vide
        validate: {
          isUrl: true, // Valide si l'URL est correcte (optionnel mais utile)
        },
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Défaut: actualité active
      },
    },
    {
      timestamps: true, // Ajoute automatiquement les colonnes createdAt et updatedAt
      tableName: 'actualites', // Nom explicite de la table dans la base de données
    });
  
    // Méthode d'instance pour désactiver une actualité
    Actualite.prototype.deactivate = function () {
      this.status = false;
      return this.save();
    };
  
    // Méthode de classe pour récupérer les actualités actives
    Actualite.getActiveActualites = function () {
      return this.findAll({ where: { status: true } });
    };
  
    return Actualite;
  };
  