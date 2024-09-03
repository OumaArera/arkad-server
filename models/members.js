module.exports = (sequelize, DataTypes) => {
    const Member = sequelize.define('Member', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      middleName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      age:{
        type: DataTypes.INTEGER,
        allowNull: false
      },
      nationality:{
        type: DataTypes.STRING,
        allowNull: false
      },
      reasonForJoining: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      memberNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      status:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending"
      }
    }, {
      timestamps: true,
    });
  
    return Member;
  };
  