module.exports = (sequelize, DataTypes) => {
  const Voluntary = sequelize.define('Voluntary', { // Renamed to Voluntary
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
      unique: false,
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
  }, {
    timestamps: true,
  });

  Voluntary.associate = (models) => {
    Voluntary.belongsTo(models.Activity, { 
      foreignKey: 'activityId', 
      as: 'activity' 
    });
  };

  return Voluntary;
};
