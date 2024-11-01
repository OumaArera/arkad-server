'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Partners', 'organizationType', {
      type: Sequelize.STRING,
      allowNull: true,  // Setting allowNull to true in migration
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Partners', 'organizationType', {
      type: Sequelize.STRING,
      allowNull: false, // Reverting back to allowNull: false in case of rollback
    });
  }
};
