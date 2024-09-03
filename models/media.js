module.exports = (sequelize, DataTypes) => {
    const Media = sequelize.define('Media', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', 
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      media: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    }, {
      timestamps: true,
    });
  
    Media.associate = (models) => {
        Media.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'user' 
      });
    };
  
    return Media;
  };
  