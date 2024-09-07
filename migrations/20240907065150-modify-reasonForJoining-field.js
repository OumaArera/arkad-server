module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Members', 'reasonForJoining', {
      type: Sequelize.TEXT,  // Change reasonForJoining to TEXT type
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Members', 'reasonForJoining', {
      type: Sequelize.STRING, // Revert reasonForJoining back to STRING
      allowNull: false,
    });
  }
};
