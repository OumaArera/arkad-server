'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modify the email column to remove any unique constraint
    await queryInterface.changeColumn('Voluntaries', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false // Ensure unique is explicitly set to false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Restore unique constraint if rolling back
    await queryInterface.changeColumn('Voluntaries', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },
};
