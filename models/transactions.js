module.exports = (sequelize, DataTypes) => {
    const Donation = sequelize.define('Donation', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber:{
        type: DataTypes.STRING,
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      mpesaReceiptNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    }, {
      timestamps: true,
    });
  
    return Donation;
  };
  