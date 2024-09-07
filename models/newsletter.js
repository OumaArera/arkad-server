module.exports = (sequelize, DataTypes) => {
    const Newsletter = sequelize.define('Newsletter', {
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
      title: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      sources: {
        type: DataTypes.JSON,
        allowNull: true,
      }
    }, {
      timestamps: true,
    });
  
    Newsletter.associate = (models) => {
        Newsletter.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'user' 
      });
    };
  
    return Newsletter;
  };
  