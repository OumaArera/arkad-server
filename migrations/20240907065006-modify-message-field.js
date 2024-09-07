module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Messages', 'message', {
      type: Sequelize.TEXT,  // Change message to TEXT type
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Messages', 'message', {
      type: Sequelize.STRING, // Revert message back to STRING
      allowNull: false,
    });
  }
};
