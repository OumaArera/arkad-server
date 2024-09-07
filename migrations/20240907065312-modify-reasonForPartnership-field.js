module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Partners', 'reasonForPartnership', {
      type: Sequelize.TEXT,  // Change reasonForPartnership to TEXT type
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Partners', 'reasonForPartnership', {
      type: Sequelize.STRING, // Revert reasonForPartnership back to STRING
      allowNull: false,
    });
  }
};
