module.exports = (sequelize, DataTypes) => {
    const Volunteer = sequelize.define('Volunteer', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      activityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Activities', 
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      timestamps: true,
    });
  
    Volunteer.associate = (models) => {
        Volunteer.belongsTo(models.Activity, { 
        foreignKey: 'activityId', 
        as: 'activity' 
      });
    };
  
    return Volunteer;
  };
  