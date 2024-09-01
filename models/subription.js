module.exports = (sequelize, DataTypes) => {
    const Subscription = sequelize.define('Subscription', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      status:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active"
      }
    }, {
      timestamps: true,
    });
  
    return Subscription;
  };
  