module.exports = (sequelize, DataTypes) => {
    const Activity = sequelize.define('Activity', {
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
      title: {
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
  
    Activity.associate = (models) => {
        Activity.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'user' 
      });
    };
  
    return Activity;
  };
  