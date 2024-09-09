module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
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
      },
      success:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    }, {
      timestamps: true,
    });
  
    return Transaction;
  };
  