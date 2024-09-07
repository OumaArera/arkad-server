module.exports = (sequelize, DataTypes) => {
    const Partner = sequelize.define('Partner', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      organizationName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      organizationType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contactNumber:{
        type: DataTypes.STRING,
        allowNull: false
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reasonForPartnership:{
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
      timestamps: true,
    });
  
    return Partner;
  };
  