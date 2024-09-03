module.exports = (sequelize, DataTypes) => {
    const Achievement = sequelize.define('Achievement', {
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
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      venue: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    }, {
      timestamps: true,
    });
  
    Achievement.associate = (models) => {
      Achievement.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'user' 
      });
    };
  
    return Achievement;
  };
  