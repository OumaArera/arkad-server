'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Messages', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'unread',
    });

    // Optionally, update existing records if needed
    // await queryInterface.bulkUpdate('Messages', { status: 'unread' }, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Messages', 'status');
  }
};
