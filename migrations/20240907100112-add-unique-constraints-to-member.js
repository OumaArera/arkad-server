module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Members', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
    await queryInterface.changeColumn('Members', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Members', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false,
    });
    await queryInterface.changeColumn('Members', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false,
    });
  }
};
