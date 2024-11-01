'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the 'role' column to the 'User' table with default value 'admin'
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'admin',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'role' column if we need to rollback
    await queryInterface.removeColumn('Users', 'role');
  }
};
