'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Members', 'declineReason', {
      type: Sequelize.STRING,
      allowNull: true, // Allow null values
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Members', 'declineReason');
  }
};
